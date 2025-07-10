import { type SecurityService, createSecuritySvc } from "@/src/service/security";

export const di = (() => {
   let securitySvc: SecurityService | undefined;
   return {
      securitySvc: () => {
         if (!securitySvc) {
            const secret = "shhhhhh_this_is_a_secret";
            securitySvc = createSecuritySvc(secret);
         }
         return securitySvc;
      },
   };
})();
