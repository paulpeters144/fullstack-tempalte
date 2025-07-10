import jwt from "jsonwebtoken";

export interface SecurityService {
   createJwtFrom: (id: string) => string;
   validJwt: (token: string | undefined) => boolean;
}

export const createSecuritySvc = (secret: string): SecurityService => {
   if (!secret || secret.length === 0) {
      throw new Error("JWT secret must be provided and cannot be empty.");
   }

   const jwtOptions: jwt.SignOptions = {
      expiresIn: "1h",
      algorithm: "HS256",
   };

   const createJwtFrom = (id: string): string => {
      const payload = { userId: id };
      const accessToken = jwt.sign(payload, secret, jwtOptions);
      return accessToken;
   };

   const validJwt = (token: string | undefined): boolean => {
      try {
         if (!token) return false;
         jwt.verify(token, secret);
         return true;
      } catch (_) {
         return false;
      }
   };
   return {
      createJwtFrom,
      validJwt,
   };
};
