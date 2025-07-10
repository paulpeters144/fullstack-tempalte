import { registerControllers } from "@/src/controllers";
import fastify, { type FastifyInstance } from "fastify";

export const app: FastifyInstance = fastify();
const PORT = 3000;

registerControllers(app);

if (require.main === module) {
   app.listen({ host: "0.0.0.0", port: PORT }, (err, address) => {
      if (err) {
         console.error(err);
         process.exit(1);
      }
      console.info(`Server listening on ${address}`);
   });
}
