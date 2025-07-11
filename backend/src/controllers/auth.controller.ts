import { di } from "@/src/util/di";
import { BadRequestError, getError } from "@/src/util/error";
import {
   type AccessToken,
   type LoginRequest,
   LoginSchema,
   type Register,
   RegisterSchema,
} from "@shared/src/types";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const authController = (app: FastifyInstance) => {
   const login = async (
      req: FastifyRequest<{ Body: LoginRequest }>,
      rep: FastifyReply,
   ): Promise<AccessToken> => {
      try {
         LoginSchema.parse(req.body);
         if (req.body.password !== "password") {
            throw new BadRequestError("invalid creds");
         }
         const jwt = di.securitySvc().createJwtFrom("12345");
         return rep.send({ accessToken: jwt });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const signup = async (
      req: FastifyRequest<{ Body: Register }>,
      rep: FastifyReply,
   ): Promise<AccessToken> => {
      try {
         RegisterSchema.parse(req.body);
         if (req.body.password !== "password") {
            throw new BadRequestError("invalid creds");
         }
         const jwt = di.securitySvc().createJwtFrom("12345");
         return rep.send({ accessToken: jwt });
      } catch (error) {
         return getError(rep, error);
      }
   };

   app.post("/api/auth/signup", signup);
   app.post("/api/auth/login", login);
};
