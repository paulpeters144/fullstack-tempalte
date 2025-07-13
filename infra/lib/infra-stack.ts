import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
   // biome-ignore lint/complexity/noUselessConstructor: <explanation>
   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
   }
}
