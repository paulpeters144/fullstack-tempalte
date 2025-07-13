import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as resource from "./resources";

export class InfraStack extends cdk.Stack {
   stage?: string;
   apiGateway: cdk.aws_apigateway.LambdaRestApi;
   apiLambda: cdk.aws_lambda.Function;
   ddbTable: cdk.aws_dynamodb.Table;
   s3Database: cdk.aws_s3.Bucket;

   constructor(scope: Construct, id: string, props: cdk.StackProps) {
      super(scope, id, props);

      if (!props?.tags?.stage) {
         throw new Error("The 'stage' tag is required in props.");
      }
      if (!props?.tags?.appName) {
         throw new Error("The 'appName' tag is required in props.");
      }

      const stage = props.tags.stage;
      const appName = props.tags.appName;

      const ddbTable = new resource.DdbTable({
         construct: this,
         appName,
         stage,
      });

      const publicBucket = new resource.S3PublicBucket({
         construct: this,
         appName,
         stage,
      });

      const apiLambda = new resource.AwsLambda({
         construct: this,
         appName,
         stage,
         publicS3Bucket: publicBucket.resource,
         ddbTable: ddbTable.resource,
      });

      new resource.ApiGateway({
         construct: this,
         appName,
         stage,
         apiLambda: apiLambda.resource,
      });

      const s3WebApp = new resource.S3WebApp({
         construct: this,
         appName,
         stage,
      });

      new resource.CloudfrontDist({
         construct: this,
         appName,
         stage,
         webAppBucket: s3WebApp.resource,
      });
   }
}
