import type { FastifyInstance } from "fastify";
import type { SimpleRes } from "~shared/src/req-res.types";

export const healthController = (app: FastifyInstance) => {
   app.get(
      "/api/health",
      (_, __): SimpleRes => ({ message: `STAGE:${process.env.STAGE}` }),
   );
};
