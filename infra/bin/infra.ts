import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { InfraStack } from "../lib/infra-stack";
require("dotenv").config();

export interface StageCtx {
   stage: string;
}

const app = new cdk.App();

const stage = app.node.tryGetContext("stage") as string;
const contenxt = app.node.tryGetContext(stage) as StageCtx;

if (!contenxt || !contenxt.stage) {
   throw new Error("stage context or env is not set");
}

if (contenxt.stage !== "uat" && contenxt.stage !== "production") {
   throw new Error("stage needs to be either uat or production");
}

const appName = "fullstack-template";
const stackName = `${appName}-${contenxt.stage}`;

new InfraStack(app, stackName, {
   env: {
      account: process.env.AWS_ACCOUNT,
      region: process.env.AWS_REGION,
   },
   stackName: stackName,
   tags: { stage: contenxt.stage, appName },
});
