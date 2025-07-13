import { register } from "@/src/controllers/index";
import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";

export const app: FastifyInstance = fastify();
const PORT = 3000;

app.register(cors, {
   origin: true,
   credentials: true,
   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
});

register.authController(app);
register.todoController(app);

if (require.main === module) {
   app.listen({ host: "0.0.0.0", port: PORT }, (err, address) => {
      if (err) {
         console.error(err);
         process.exit(1);
      }
      console.info(`Server listening on ${address}`);
   });
}
