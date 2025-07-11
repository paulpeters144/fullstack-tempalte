export interface Claims {
   role: Role;
   email: string;
}

export interface AccessToken {
   accessToken: string;
}

export interface UserClaims {
   id: string;
   email: string;
   role: Role;
}

export interface UserBasic extends UserClaims {
   createdAt: Date;
   lastLogin?: Date;
}

export interface UserAllInfo extends UserBasic {
   password: string;
}

export interface SimpleResponse {
   message: string;
}

export interface FriendlyError {
   error: string;
}

export interface TodoItem {
   id: string;
   title: string;
   description?: string;
   status: TodoStatus;
   priority: TodoPriority;
   userId: string;
   createdAt: Date;
   updatedAt: Date;
   dueDate?: Date;
}

import { z } from "zod";

const passwordErrorMessage = "Password must be between 8 and 32 characters";
export const LoginSchema = z.object({
   email: z.email(),
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

export const RegisterSchema = z
   .object({
      email: z.email(),
      password: z.string().min(8).max(32),
      repassword: z.string().min(8).max(32),
      role: z.enum(["admin", "editor", "user", "guest"]),
   })
   .refine(
      (s) => {
         const passwordsMatch = s.password === s.repassword;
         return passwordsMatch;
      },
      {
         message: "Passwords were not the same. Please try again.",
         path: ["repassword"],
      },
   );

export type Register = z.infer<typeof RegisterSchema>;

export type Role = "admin" | "editor" | "user" | "guest";

export type Stage = "local" | "production";

export type TodoStatus = "pending" | "in-progress" | "completed";

export type TodoPriority = "low" | "medium" | "high";

export const CreateTodoSchema = z.object({
   title: z.string().min(1, "Title is required").max(200, "Title too long"),
   description: z.string().optional(),
   priority: z.enum(["low", "medium", "high"]).default("medium"),
   dueDate: z.string().datetime().optional(),
});
export type CreateTodoRequest = z.infer<typeof CreateTodoSchema>;

export const UpdateTodoSchema = z.object({
   id: z.string().min(1, "ID is required"),
   title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title too long")
      .optional(),
   description: z.string().optional(),
   status: z.enum(["pending", "in-progress", "completed"]).optional(),
   priority: z.enum(["low", "medium", "high"]).optional(),
   dueDate: z.string().datetime().optional(),
});
export type UpdateTodoRequest = z.infer<typeof UpdateTodoSchema>;

export const TodoParamsSchema = z.object({
   id: z.string().min(1, "ID is required"),
});
export type TodoParams = z.infer<typeof TodoParamsSchema>;
