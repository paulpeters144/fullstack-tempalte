import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface AwsLambdaProps {
   construct: Construct;
   appName: string;
   stage: string;
   publicS3Bucket: cdk.aws_s3.Bucket;
   ddbTable: cdk.aws_dynamodb.Table;
}

export class AwsLambda {
   resource: cdk.aws_lambda.Function;

   constructor(props: AwsLambdaProps) {
      const { construct, appName, stage, publicS3Bucket, ddbTable } = props;
      const apiLambdaName = `${appName}-lambda-${stage}`;
      this.resource = new cdk.aws_lambda.Function(construct, apiLambdaName, {
         functionName: apiLambdaName,
         timeout: cdk.Duration.seconds(5),
         runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
         code: cdk.aws_lambda.Code.fromAsset("../backend/dist"),
         handler: "lambda.handler",
         architecture: cdk.aws_lambda.Architecture.ARM_64,
         memorySize: 512,
      });

      ddbTable.grantReadWriteData(this.resource);

      this.resource.addToRolePolicy(
         new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ["s3:GetObject"],
            resources: [`${publicS3Bucket.bucketArn}/*`],
         }),
      );
   }
}
