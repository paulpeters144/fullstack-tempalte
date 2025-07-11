import { di } from "@/src/util/di";
import { BadRequestError, getError } from "@/src/util/error";
import {
   type AccessToken,
   type LoginRequest,
   LoginSchema,
   type Register,
   RegisterSchema,
   type SimpleResponse,
   type UserAllInfo,
   type UserBasic,
} from "@shared/src/types";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const authController = (app: FastifyInstance) => {
   const secSvc = di.securitySvc();
   const ddb = di.ddbAccess();

   const signup = async (
      req: FastifyRequest<{ Body: Register }>,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         RegisterSchema.parse(req.body);
         const key = `USER#EMAIL#${req.body.email.toLocaleLowerCase()}`;
         const user = await ddb.getItem<UserAllInfo>({
            itemKey: { pk: key, sk: key },
         });

         if (user) {
            throw new BadRequestError("user already registered");
         }

         const pwdHash = secSvc.hashPassword(req.body.password);
         await ddb.putItem<UserAllInfo>({
            key: { pk: key, sk: key },
            item: {
               id: crypto.randomUUID().replaceAll("-", "").slice(0, 25),
               email: req.body.email,
               password: pwdHash,
               role: req.body.role,
               createdAt: new Date(),
            },
         });
         return rep.send({ message: "ok" });
      } catch (e) {
         return getError(rep, e);
      }
   };

   const login = async (
      req: FastifyRequest<{ Body: LoginRequest }>,
      rep: FastifyReply,
   ): Promise<AccessToken> => {
      try {
         LoginSchema.parse(req.body);

         const key = `USER#EMAIL#${req.body.email.toLocaleLowerCase()}`;
         const user = await ddb.getItem<UserAllInfo>({
            itemKey: { pk: key, sk: key },
         });

         if (!user) {
            throw new BadRequestError(`user not found ${req.body.email}`);
         }
         if (!secSvc.verifyPassword(req.body.password, user.password)) {
            throw new BadRequestError("password is incorrect");
         }

         const jwt = secSvc.createJwtFrom(user);
         return rep.send({ accessToken: jwt });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const getUser = async (req: FastifyRequest, rep: FastifyReply) => {
      try {
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);
         const key = `USER#EMAIL#${claims.email.toLocaleLowerCase()}`;
         const user = await ddb.getItem<UserBasic>({
            itemKey: { pk: key, sk: key },
            pickKeys: ["id", "email", "role", "createdAt", "lastLogin"],
         });
         return rep.send(user);
      } catch (e) {
         return getError(rep, e);
      }
   };

   const authorize = async (req: FastifyRequest, reply: FastifyReply) => {
      if (req.url.match("/auth/user")) {
         try {
            const hashJwt = req.headers.authorization?.split("Bearer ")[1];
            if (!secSvc.validJwt(hashJwt)) {
               reply.code(401).send({ message: "Unauthorized" });
            }
         } catch (error) {
            console.error(JSON.stringify(error));
            reply.code(401).send({ message: "Unauthorized" });
         }
      }
   };

   app.addHook("onRequest", authorize);
   app.post("/api/auth/signup", signup);
   app.post("/api/auth/login", login);
   app.get("/api/auth/user", getUser);
};
