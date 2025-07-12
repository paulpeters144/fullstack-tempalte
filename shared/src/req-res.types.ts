import { z } from "zod";
import { type TodoItem, TodoStatusEnum } from "./domain.types";

export interface FriendlyErrorRes {
   error: string;
}

export interface SimpleRes {
   message: string;
}

export interface AccessTokenRes {
   accessToken: string;
}

export const loginSchema = z.object({
   email: z.email(),
   password: z
      .string()
      .min(8, { message: "Password must be more than 8 characters" })
      .max(32, { message: "Password must be less than 32 characters" }),
});
export type LoginReq = z.infer<typeof loginSchema>;
export type LoginRes = { accessToken: string };

export const registerSchema = z
   .object({
      email: z.email(),
      password: z
         .string()
         .min(8, { message: "Password must be more than 8 characters" })
         .max(32, { message: "Password must be less than 32 characters" }),
      repassword: z
         .string()
         .min(8, { message: "Password must be more than 8 characters" })
         .max(32, { message: "Password must be less than 32 characters" }),
      role: z.enum(["admin", "editor", "user", "guest"]).default("user"),
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
export type RegisterReq = z.infer<typeof registerSchema>;
export type RegisterRes = { message: string };

export const createTodoSchema = z.object({
   todo: z
      .string()
      .min(1, { message: "todo is required." })
      .max(200, { message: "todo must not exceed 200 characters." }),
   status: TodoStatusEnum.default("in-progress"),
});
export type CreateTodoReq = z.infer<typeof createTodoSchema>;
export type CreateTodoRes = { todoId: string };

export const todoParamsSchema = z.object({
   id: z.string().min(1, "ID is required"),
});
export type TodoParams = z.infer<typeof todoParamsSchema>;

export const patchTodoSchema = z
   .object({
      todo: z
         .string()
         .min(1, "todo is required")
         .max(200, "todo too long")
         .optional(),
      status: TodoStatusEnum.optional(),
   })
   .refine((s) => s.status || s.todo, {
      message: "at least one field must be provided for update: 'status', 'todo'",
   });
export type PatchTodoReq = z.infer<typeof patchTodoSchema>;
export type PatchTodoRes = TodoItem;
