const { exec: execCb } = require("node:child_process");
const { promisify } = require("node:util");
const {
   CreateTableCommand,
   DeleteTableCommand,
   DescribeTableCommand,
   DynamoDBClient,
   ResourceNotFoundException,
} = require("@aws-sdk/client-dynamodb");
const chalk = require("chalk");

const exec = promisify(execCb);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tableName = "app-table";

let c;
const getDdbClient = () => {
   if (!c) {
      c = new DynamoDBClient({
         region: "localhost",
         endpoint: "http://localhost:8000",
         credentials: {
            accessKeyId: "dummy",
            secretAccessKey: "dummy",
         },
      });
   }
   return c;
};

const failure = (msg) => {
   console.info(chalk.red(`[X] ${msg}`));
};

const success = (msg) => {
   console.info(chalk.green(`[✓] ${msg}`));
};

const neutral = (msg) => {
   console.info(chalk.yellow(`[-] ${msg}`));
};

const runningCorrectNodeVersion = async () => {
   const message = "using node v22";
   await delay(0);
   if (process.version.startsWith("v22")) {
      success(message);
   } else {
      failure(message);
      process.exit(1);
   }
};

const checkDockerRunning = async () => {
   const message = "docker is running";
   try {
      await exec("docker info", { shell: true });
      success(message);
   } catch (_) {
      failure(message);
      process.exit(1);
   }
};

const ensureDynamoDBContainerIsUp = async () => {
   const imageName = "amazon/dynamodb-local";

   try {
      let { stdout: imageCheckStdout, stderr: imageCheckStderr } = await exec(
         `docker ps --filter "ancestor=${imageName}"`,
         { shell: true },
      );
      imageCheckStdout = imageCheckStdout.includes("\n")
         ? imageCheckStdout.split("\n")[1].trim()
         : imageCheckStdout;

      if (imageCheckStderr) {
         const msg = "Warning during Docker image check:";
         neutral(`${msg} ${imageCheckStderr.trim()}`);
      }

      const imageExists = imageCheckStdout.includes(imageName);

      if (!imageExists) {
         neutral(`docker container '${imageName}' not found running locally`);
         const msg = `from the docker context directory './docker' run "docker-compose up"`;
         neutral(msg);
         failure("failed to ensure the local ddb container is running");
         process.exit(1);
      } else {
         success(`container '${imageName}' found locally.`);
         return;
      }
   } catch (error) {
      failure(
         `failed to ensure the local ddb container is running: ${error.message}`,
      );
      process.exit(1);
   }
};

async function tableExists(tableName) {
   try {
      const client = getDdbClient();
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      return true;
   } catch (error) {
      if (error instanceof ResourceNotFoundException) {
         return false;
      }
      failure(`Error checking table existence for '${tableName}':`, error);
      throw error;
   }
}

async function dropTable(tableName) {
   const client = getDdbClient();
   const deleteParams = {
      TableName: tableName,
   };
   await client.send(new DeleteTableCommand(deleteParams));

   let deleted = false;
   let attempts = 0;
   const maxAttempts = 10;
   const delayMs = 500;

   while (!deleted && attempts < maxAttempts) {
      await delay(delayMs);
      if (!(await tableExists(tableName, client))) {
         deleted = true;
      }
      attempts++;
   }
}

const createOrRecreateDdbTable = async () => {
   try {
      const client = getDdbClient();
      if (await tableExists(tableName)) {
         await dropTable(tableName);
      }

      const params = {
         TableName: tableName,
         KeySchema: [
            { AttributeName: "pk", KeyType: "HASH" },
            { AttributeName: "sk", KeyType: "RANGE" },
         ],
         AttributeDefinitions: [
            { AttributeName: "pk", AttributeType: "S" },
            { AttributeName: "sk", AttributeType: "S" },
         ],
         ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
         },
      };

      const data = await client.send(new CreateTableCommand(params));
      if (data.Error) {
         failure(`error trying to create table ${data.Error}`);
      }
      success(`table created successfully: ${data.TableDescription?.TableName}`);
   } catch (error) {
      const msg = "failed to ensure the local ddb container is running:";
      failure(`${msg} ${error.message}`);
      process.exit(1);
   }
};

(async function main() {
   await runningCorrectNodeVersion();
   await checkDockerRunning();
   await ensureDynamoDBContainerIsUp();
   await createOrRecreateDdbTable();
})();
