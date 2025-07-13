const { program } = require("commander");
const { execSync } = require("node:child_process");
const { deleteDirectory, esBuildProject } = require("./util");

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
      console.info(`stage configured:    [${stage}]`);
      deleteDirectory("./preDist");
      deleteDirectory("./dist");

      console.info("transpiling project  [1/3]");
      execSync("npx tsc -p tsconfig.json");

      console.info("building project     [2/3]");
      const file = stage === "local" ? "server" : "lambda";
      await esBuildProject(file, stage);

      deleteDirectory("./preDist");
      console.info("done!                [3/3]");
   } catch (err) {
      console.error("Error:", err);
   }
}

main();
