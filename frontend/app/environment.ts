export type Stage = "prod" | "uat" | "local";

interface IEnvironment {
   apiBaseUrl?: string;
   cookieKey?: string;
   stage?: Stage;
}

const environment: IEnvironment = (() => {
   const stage = (import.meta.env?.VITE_STAGE as Stage) ?? "local";
   return {
      apiBaseUrl: import.meta.env?.VITE_API_URL ?? "",
      cookieKey: import.meta.env?.VITE_COOKIE_KEY ?? "",
      stage,
      lastBuild: import.meta.env?.VITE_BUILD_TIMESTAMP,
      cache: {},
      mixpanel: (() => {
         if (stage === "prod") {
            return {
               project: import.meta.env?.VITE_PROD_MIXPANEL_PROJECT,
            };
         }
         if (stage === "uat") {
            return {
               project: import.meta.env?.VITE_UAT_MIXPANEL_PROJECT,
            };
         }
         return {};
      })(),
   };
})();

(() => {
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   const _missingVars = (obj: Record<string, any>, path = "") => {
      for (const [key, val] of Object.entries(obj)) {
         const fullPath = path ? `${path}.${key}` : key;
         if (val === undefined || val === null || val === "") {
            console.error(`missing env var: ${fullPath}`);
         } else if (typeof val === "object" && !Array.isArray(val)) {
            _missingVars(val, fullPath);
         }
      }
   };
})();

export { environment };
