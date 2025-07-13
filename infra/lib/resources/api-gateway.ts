import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface ApiGatewayProps {
   construct: Construct;
   appName: string;
   stage: string;
   apiLambda: cdk.aws_lambda.Function;
}

export class ApiGateway {
   resource: cdk.aws_apigatewayv2.HttpApi;

   constructor({ construct, appName, stage, apiLambda }: ApiGatewayProps) {
      const apiGatewayName = `${appName}-api-gateway-${stage}`;

      this.resource = new cdk.aws_apigatewayv2.HttpApi(construct, apiGatewayName, {
         apiName: apiGatewayName,
         description: `HTTP API Gateway for ${appName} in ${stage}`,
         createDefaultStage: false,
      });

      this.resource.addStage(`${appName}-stage-${stage}`, {
         autoDeploy: true,
         stageName: "$default",
         throttle: {
            burstLimit: 30,
            rateLimit: 50,
         },
      });

      const { HttpLambdaIntegration } = cdk.aws_apigatewayv2_integrations;
      const lambdaIntegration = new HttpLambdaIntegration(
         `${appName}-api-lambda-integration-${stage}`,
         apiLambda,
      );

      this.resource.addRoutes({
         path: "/{proxy+}",
         methods: [cdk.aws_apigatewayv2.HttpMethod.ANY],
         integration: lambdaIntegration,
      });

      new cdk.CfnOutput(construct, "HttpApiUrl", {
         value: this.resource.apiEndpoint,
         description: "The URL of the HTTP API Gateway",
      });
   }
}
