import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import type { UserClaims } from "@shared/src/domain.types";
import jwt from "jsonwebtoken";

export interface SecurityService {
   createJwtFrom: (claims: UserClaims) => string;
   validJwt: (token: string | undefined) => boolean;
   getClaims: (token: string) => UserClaims;
   hashPassword: (password: string) => string;
   verifyPassword: (password: string, storedHash: string) => boolean;
}

export const createSecuritySvc = (secret: string): SecurityService => {
   if (!secret || secret.length === 0) {
      throw new Error("JWT secret must be provided and cannot be empty.");
   }

   const jwtOptions: jwt.SignOptions = {
      expiresIn: "1h",
      algorithm: "HS256",
   };

   const createJwtFrom = (claims: UserClaims): string => {
      const payload = { id: claims.id, role: claims.role, email: claims.email };
      const accessToken = jwt.sign(payload, secret, jwtOptions);
      return accessToken;
   };

   const getClaims = (token: string): UserClaims => {
      const decoded = jwt.verify(token, secret);
      if (typeof decoded !== "object" || !decoded) {
         throw new Error("invalid JWT payload forma.");
      }
      if ("id" in decoded && "role" in decoded && "email" in decoded) {
         return decoded as UserClaims;
      }
      throw new Error("invalid JWT payload forma.");
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

   const hashPassword = (password: string): string => {
      const salt = randomBytes(16).toString("hex");
      const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
      return `${salt}:${hash}`;
   };

   const verifyPassword = (password: string, storedHash: string): boolean => {
      const [salt, hash] = storedHash.split(":");
      const hashToVerify = pbkdf2Sync(password, salt, 100_000, 64, "sha512");
      const originalHash = Buffer.from(hash, "hex");
      return timingSafeEqual(hashToVerify, originalHash);
   };

   return {
      createJwtFrom,
      validJwt,
      getClaims,
      hashPassword,
      verifyPassword,
   };
};
