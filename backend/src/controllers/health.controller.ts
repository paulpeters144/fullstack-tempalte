import type { SimpleRes } from "@shared/src/req-res.types";
import type { FastifyInstance } from "fastify";

export const healthController = (app: FastifyInstance) => {
   app.get(
      "/api/health",
      (_, __): SimpleRes => ({ message: `STAGE:${process.env.STAGE}` }),
   );
};
