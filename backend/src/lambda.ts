import awsLambdaFastify from "@fastify/aws-lambda";

import { app } from "./server";

const proxy = awsLambdaFastify(app);
export { proxy as handler };
