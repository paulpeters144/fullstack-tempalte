import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";
import chalk from "chalk";

const exec = promisify(execCb);

const success = (msg) => {
   console.info(chalk.green(`[✓] ${msg}`));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const failure = (msg) => {
   console.info(chalk.red(`[X] ${msg}`));
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

const ddbImageIsPresent = async () => {
   const message = "found dynamodb image locally";
   try {
      const cmd =
         'docker images --filter "reference=amazon/dynamodb-local" --format "{{.Repository}}"';
      const { stdout, stderr } = await exec(cmd, { shell: true });

      if (stderr) {
         throw new Error(stderr);
      }

      const imageExists = stdout.trim() === "amazon/dynamodb-local";

      if (!imageExists) {
         throw new Error("docker image not found locally");
      }

      success(message);
   } catch (_) {
      failure(message);
      process.exit(1);
   }
};

(async function main() {
   await runningCorrectNodeVersion();
   await checkDockerRunning();
   await ddbImageIsPresent();
})();
