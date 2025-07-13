const { program } = require("commander");
const { execSync } = require("node:child_process");
const {
   deleteDirectory,
   esBuildProject,
   zipDir,
   uploadToAwsLambda,
   copyFile,
} = require("./util");

program
   .version("0.0.1")
   .description("Command line tool for building the api")
   .option("-s, --STAGE <value>", "Specify the application stage")
   .parse(process.argv);

const stage = program.opts().STAGE;
if (!stage) {
   console.error("STAGE not specified");
   process.exit(1);
}

async function main() {
   try {
      console.info(`stage configured:   [${stage}]`);

      console.info("cleaning old build  [1/6]");
      deleteDirectory("./preDist");
      deleteDirectory("./dist");

      console.info("transpiling project [2/6]");
      execSync("npx tsc -p tsconfig.json");

      const file = stage === "local" ? "server" : "lambda";
      await esBuildProject(file, stage);

      console.info("building project    [3/6]");
      copyFile(`./src/config/.config.${stage}.yaml`, "./dist");

      console.info("zipping project     [4/6]");
      await zipDir("./dist", "./preDist/lambda.zip");
      copyFile("./preDist/lambda.zip", "./dist");

      console.info("uploading artifact  [5/6]");
      uploadToAwsLambda("dist/lambda.zip", stage);

      deleteDirectory("./preDist");
      deleteDirectory("./dist");

      console.info("done!               [6/6]");
      process.exit(0);
   } catch (err) {
      console.error("Error:", err);
   }
}

main();
