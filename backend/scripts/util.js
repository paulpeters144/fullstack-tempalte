const { build } = require("esbuild");
const archiver = require("archiver");
const fs = require("node:fs");

async function zipDir(sourceDir, outPath) {
   const archive = archiver("zip", {
      zlib: { level: 9 },
   });
   const output = fs.createWriteStream(outPath);

   return new Promise((resolve, reject) => {
      output.on("close", () => {
         resolve();
      });

      archive.on("error", (err) => reject(err));

      archive.pipe(output);

      archive.directory(sourceDir, false);
      archive.finalize();
   });
}

/**
 *
 * @param {string} dirPath
 * @returns {void}
 */
function deleteDirectory(dirPath) {
   if (!fs.existsSync(dirPath)) {
      console.info(`directory does not exist: ${dirPath}`);
      return;
   }

   const stats = fs.statSync(dirPath);
   if (!stats.isDirectory()) {
      console.info(`path is not a directory: ${dirPath}`);
      return;
   }

   try {
      fs.rmSync(dirPath, { recursive: true });
      console.info(`deleted directory: ${dirPath}`);
   } catch (err) {
      console.error(`Error deleting directory: ${dirPath}`, err);
   }
}

/**
 *
 * @param {string} file
 * @param {string} stage
 * @returns {Promise}
 */
function esBuildProject(file, stage) {
   return build({
      entryPoints: [`./preDist/backend/src/${file}`],
      bundle: true,
      minify: true,
      platform: "node",
      sourcemap: true,
      target: "node20.11",
      outdir: "dist",
      define: {
         "process.env.STAGE": `"${stage}"`,
      },
   })
      .catch(() => {
         console.error("error occured during esbuild");
         process.exit(1);
      })
      .finally(() => console.log("ESBUILD FINISHED"));
}

module.exports = {
   deleteDirectory,
   esBuildProject,
   zipDir,
};
