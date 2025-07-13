const { build } = require("esbuild");
const archiver = require("archiver");
const fs = require("node:fs");
const { execSync } = require("node:child_process");
const path = require("node:path");

/**
 *
 * @param {string} fileLocation
 * @param {string} stage
 * @returns {void}
 */
function uploadToAwsLambda(fileLocation, stage) {
   const cmd =
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      // biome-ignore lint/style/useTemplate: <explanation>
      `aws lambda update-function-code --function-name ` +
      `fullstack-template-lambda-${stage} ` +
      `--zip-file fileb://${fileLocation}`;
   execSync(cmd);
}

async function zipDir(sourceDir, outPath) {
   const archive = archiver("zip", { zlib: { level: 9 } });
   const stream = fs.createWriteStream(outPath);

   return new Promise((resolve, reject) => {
      archive
         .directory(sourceDir, false)
         .on("error", (err) => reject(err))
         .pipe(stream);

      stream.on("close", () => resolve());
      archive.finalize();
   });
}

/**
 * Copies a file from source path to destination path.
 *
 * @param {string} srcPath - The full path to the source file.
 * @param {string} destDir - The directory where the file should be copied.
 */
function copyFile(srcPath, destDir) {
   if (!fs.existsSync(srcPath)) {
      throw new Error(`Source file does not exist: ${srcPath}`);
   }

   if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
   }

   const fileName = path.basename(srcPath);
   const destPath = path.join(destDir, fileName);

   fs.copyFileSync(srcPath, destPath);
}

/**
 *
 * @param {string} dirPath
 * @returns {void}
 */
function deleteDirectory(dirPath) {
   if (!fs.existsSync(dirPath)) {
      return;
   }

   const stats = fs.statSync(dirPath);
   if (!stats.isDirectory()) {
      return;
   }

   try {
      fs.rmSync(dirPath, { recursive: true });
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
   }).catch(() => {
      console.error("error occured during esbuild");
      process.exit(1);
   });
}

module.exports = {
   deleteDirectory,
   esBuildProject,
   zipDir,
   copyFile,
   uploadToAwsLambda,
};
