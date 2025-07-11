import { type SecurityService, createSecuritySvc } from "@/src/service/security";
import { type DdbAccess, createDdbAccess } from "../access/ddb.access";

export const di = (() => {
   let securitySvc: SecurityService | undefined;
   let ddbAccess: DdbAccess | undefined;
   return {
      securitySvc: () => {
         if (!securitySvc) {
            const secret = "shhhhhh_this_is_a_secret";
            securitySvc = createSecuritySvc(secret);
         }
         return securitySvc;
      },
      ddbAccess: () => {
         if (!ddbAccess) {
            ddbAccess = createDdbAccess();
         }
         return ddbAccess;
      },
   };
})();
