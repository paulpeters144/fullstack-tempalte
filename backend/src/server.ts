import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";
import register, * as ctrl from "~/src/controllers/z_register";

export const app: FastifyInstance = fastify();
const PORT = 3000;

app.register(cors, {
   origin: true,
   credentials: true,
   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
});

register(app).withController(
   ctrl.authController,
   ctrl.todoController,
   ctrl.healthController,
);

if (require.main === module) {
   app.listen({ host: "0.0.0.0", port: PORT }, (err, address) => {
      if (err) {
         console.error(err);
         process.exit(1);
      }
      console.info(`Server listening on ${address}`);
   });
}
