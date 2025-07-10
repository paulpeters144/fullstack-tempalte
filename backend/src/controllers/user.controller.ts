import { getError } from "@/src/util/error";
import { type Person, PersonSchema } from "@shared/types";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const userController = (app: FastifyInstance) => {
   const simpleHello = async (
      req: FastifyRequest<{ Body: Person }>,
      rep: FastifyReply,
   ) => {
      try {
         PersonSchema.parse(req.body);
         const { name, age } = req.body;
         const msg = `Hello, ${name}!!! You are ${age} years old.`;
         return rep.send({ message: msg });
      } catch (error) {
         return getError(rep, error);
      }
   };

   app.post("/user/sayhello", simpleHello);
};
