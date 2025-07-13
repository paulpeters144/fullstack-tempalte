import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "yaml";

export interface Env {
   stage: string;
   region: string;
   ddbTable: string;
}

export const env: Env = (() => {
   const filePath = `.config.${process.env.STAGE}.yaml`;
   const yamlFilePath = path.join(__dirname, filePath);
   const fileContents = fs.readFileSync(yamlFilePath, "utf8");

   const yaml: Record<string, string> = parse(fileContents);
   const result: Env = {
      stage: yaml.stage,
      ddbTable: `${yaml.ddbTableBaseName}-${yaml.stage}`,
      region: yaml.region,
   };
   return result;
})();
