import { adminController } from "@/src/controllers/admin.controller";
import { authController } from "@/src/controllers/auth.controller";
import type { FastifyInstance } from "fastify";

export const registerControllers = (app: FastifyInstance) => {
   authController(app);
   adminController(app);
};
