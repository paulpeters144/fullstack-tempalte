import { authController } from "@/src/controllers/auth.controller";
import { healthController } from "@/src/controllers/health.controller";
import { todoController } from "@/src/controllers/todo.controller";

export const register = {
   authController,
   todoController,
   healthController,
};
