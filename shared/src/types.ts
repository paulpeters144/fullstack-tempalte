export interface Claims {
   role: Role;
   email: string;
}

export interface AccessToken {
   accessToken: string;
}

export interface UserBasic {
   email: string;
   userId: string;
   createdAt: Date;
   lastLogin?: Date;
   role: Role;
}

export interface UserAllInfo extends UserBasic {
   passwordHash: string;
   saltHash: string;
}

export interface SimpleResponse {
   message: string;
}

export interface FriendlyError {
   error: string;
}

import { z } from "zod";

// -=-=-=-=-=-=-VALIDATION-=-=-=-=-=-=-
const passwordErrorMessage = "Password must be between 8 and 32 characters";
export const LoginSchema = z.object({
   email: z.string().email(),
   password: z
      .string()
      .min(8, { message: passwordErrorMessage })
      .max(32, { message: passwordErrorMessage }),
});
export type LoginRequest = z.infer<typeof LoginSchema>;

export const PersonSchema = z.object({
   name: z.string(),
   age: z.number(),
});
export type Person = z.infer<typeof PersonSchema>;

export const RegisterSchema = z.object({
   email: z.email(),
   password: z.string().min(8).max(32),
   repassword: z.string().min(8).max(32),
   role: z.enum(["admin", "editor", "user", "guest"]),
});
export type Register = z.infer<typeof RegisterSchema>;

export type Role = "admin" | "editor" | "user" | "guest";

// -=-=-=-=-=-=-VALIDATION-=-=-=-=-=-=-

export type Stage = "local" | "production";
