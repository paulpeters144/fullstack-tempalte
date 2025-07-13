const { execSync } = require("node:child_process");

async function main() {
   try {
      const stage = "uat";
      console.info(`building for stage: [${stage}]`);

      console.info("building backend dist");
      execSync("pnpm run build:uat:lambda", { cwd: "../backend" });

      console.info("building frontend build");
      execSync("pnpm run build", { cwd: "../frontend" });
   } catch (err) {
      console.error("Error:", err);
   }
}

main();
