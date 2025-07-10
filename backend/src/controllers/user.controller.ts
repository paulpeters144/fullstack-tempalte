import { di } from "@/src/util/di";
import { BadRequestError, getError } from "@/src/util/error";
import {
   type AccessToken,
   type LoginRequest,
   LoginSchema,
   type Person,
   PersonSchema,
   type SimpleResponse,
} from "@shared/types";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const userController = (app: FastifyInstance) => {
   const simpleHello = async (
      req: FastifyRequest<{ Body: Person }>,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         PersonSchema.parse(req.body);
         const { name, age } = req.body;
         const msg = `Hello, ${name}!!! You are ${age} years old.`;
         return rep.send({ message: msg });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const login = async (
      req: FastifyRequest<{ Body: LoginRequest }>,
      rep: FastifyReply,
   ): Promise<AccessToken> => {
      try {
         LoginSchema.parse(req.body);
         if (req.body.password !== "password") {
            throw new BadRequestError("invalid creds");
         }
         console.log(req.body);
         const jwt = di.securitySvc().createJwtFrom("12345");
         return rep.send({ accessToken: jwt });
      } catch (error) {
         return getError(rep, error);
      }
   };

   app.post("/api/user/sayhello", simpleHello);
   app.post("/api/user/login", login);
};
