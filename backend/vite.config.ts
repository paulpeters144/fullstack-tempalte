import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
   plugins: [tsconfigPaths()],
   test: {
      globals: true,
      environment: "node",
   },
   resolve: {
      alias: {
         "@shared": path.resolve(__dirname, "../shared"),
      },
   },
});
