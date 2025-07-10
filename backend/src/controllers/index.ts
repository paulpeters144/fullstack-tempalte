import { userController } from "@/src/controllers/user.controller";
import type { FastifyInstance } from "fastify";

export const registerControllers = (app: FastifyInstance) => {
   userController(app);
};
