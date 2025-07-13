import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface S3PublicBucketProps {
   construct: Construct;
   appName: string;
   stage: string;
}

export class S3PublicBucket {
   resource: cdk.aws_s3.Bucket;

   constructor({ construct, appName, stage }: S3PublicBucketProps) {
      const bucketName = `${appName}-${stage}-public-dk82xe`;
      this.resource = new cdk.aws_s3.Bucket(construct, bucketName, {
         bucketName: bucketName,
         removalPolicy: cdk.RemovalPolicy.DESTROY,
         publicReadAccess: true,
         blockPublicAccess: {
            blockPublicAcls: false,
            blockPublicPolicy: false,
            ignorePublicAcls: false,
            restrictPublicBuckets: false,
         },
      });

      this.resource.addToResourcePolicy(
         new cdk.aws_iam.PolicyStatement({
            actions: ["s3:GetObject"],
            resources: [`${this.resource.bucketArn}/*`],
            effect: cdk.aws_iam.Effect.ALLOW,
            principals: [new cdk.aws_iam.ArnPrincipal("*")],
         }),
      );
   }
}
