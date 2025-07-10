import { di } from "@/src/util/di";
import { getError } from "@/src/util/error";
import type { SimpleResponse } from "@shared/src/types";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const adminController = (app: FastifyInstance) => {
   const securitySvc = di.securitySvc();

   const protectedRoute = async (
      _: FastifyRequest,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         const msg = "nice :) you're authorized for this route";
         return rep.send({ message: msg });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const authorize = async (req: FastifyRequest, reply: FastifyReply) => {
      if (req.url.match("/admin")) {
         try {
            const hashJwt = req.headers.authorization?.split("Bearer ")[1];
            if (!securitySvc.validJwt(hashJwt)) {
               reply.code(401).send({ message: "Unauthorized" });
            }
         } catch (error) {
            console.error(JSON.stringify(error));
            reply.code(401).send({ message: "Unauthorized" });
         }
      }
   };

   app.get("/api/admin/protected", protectedRoute);
   app.addHook("onRequest", authorize);
};
