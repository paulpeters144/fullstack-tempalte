import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface DdbTableProps {
   construct: Construct;
   appName: string;
   stage: string;
}

export class DdbTable {
   resource: cdk.aws_dynamodb.Table;

   constructor(props: DdbTableProps) {
      const { construct, appName, stage } = props;
      const tableName = `${appName}-ddb-table-${stage}`;
      this.resource = new cdk.aws_dynamodb.Table(construct, tableName, {
         partitionKey: { name: "PK", type: cdk.aws_dynamodb.AttributeType.STRING },
         sortKey: { name: "SK", type: cdk.aws_dynamodb.AttributeType.STRING },
         tableName: tableName,
         removalPolicy: cdk.RemovalPolicy.DESTROY, // warning. review if you want this
         billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      });
   }
}
