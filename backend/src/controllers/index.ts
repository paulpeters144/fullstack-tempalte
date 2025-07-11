import { authController } from "@/src/controllers/auth.controller";
import type { FastifyInstance } from "fastify";
import { todoController } from "./todo.controller";

export const registerControllers = (app: FastifyInstance) => {
   authController(app);
   todoController(app);
};
