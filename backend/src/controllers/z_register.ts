export { authController } from "~/src/controllers/auth.controller";
export { healthController } from "~/src/controllers/health.controller";
export { todoController } from "~/src/controllers/todo.controller";
import type { FastifyInstance } from "fastify";

export default function register(app: FastifyInstance) {
   return {
      withController: (...controllers: ((app: FastifyInstance) => void)[]) => {
         for (const c of controllers) c(app);
      },
   };
}
