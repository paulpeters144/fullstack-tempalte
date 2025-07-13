import type { Stage } from "@/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL = (() => {
   let stage = import.meta.env?.VITE_STAGE ?? "";
   if (!stage) {
      console.info('no stage found setting stage to "prod"');
      stage = "prod";
   }
   const levelMap: Record<Stage, LogLevel> = {
      prod: "error",
      uat: "info",
      local: "debug",
   };
   return levelMap[stage as Stage];
})();

class Logger {
   private level: LogLevel;

   constructor(level: LogLevel) {
      this.level = level;
   }

   private shouldLog(currentLevel: LogLevel): boolean {
      const levels: LogLevel[] = ["debug", "info", "warn", "error"];
      return levels.indexOf(currentLevel) >= levels.indexOf(this.level);
   }

   // biome-ignore lint/suspicious/noExplicitAny: Allowing flexible logging inputs for convenience.
   private log(level: LogLevel, message?: any, ...optionalParams: any[]): void {
      if (!this.shouldLog(level)) return;

      const messages = [];
      if (message) messages.push(message);
      optionalParams?.map((param) => messages.push(param));

      console[level](...messages);
   }

   // biome-ignore lint/suspicious/noExplicitAny: Allowing flexible logging inputs for convenience.
   debug(message?: any, ...optionalParams: any[]): void {
      this.log("debug", message, ...optionalParams);
   }

   // biome-ignore lint/suspicious/noExplicitAny: Allowing flexible logging inputs for convenience.
   info(message?: any, ...optionalParams: any[]): void {
      this.log("info", message, ...optionalParams);
   }

   // biome-ignore lint/suspicious/noExplicitAny: Allowing flexible logging inputs for convenience.
   warn(message?: any, ...optionalParams: any[]): void {
      this.log("warn", message, ...optionalParams);
   }

   // biome-ignore lint/suspicious/noExplicitAny: Allowing flexible logging inputs for convenience.
   error(message?: any, ...optionalParams: any[]): void {
      this.log("error", message, ...optionalParams);
   }
}

const log = new Logger(LOG_LEVEL);
console.info("loglevel", LOG_LEVEL);
export default log;
