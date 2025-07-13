import { z } from "zod";

export type Role = "admin" | "editor" | "user" | "guest";

export type Stage = "local" | "production";

export const TodoStatusEnum = z.enum(["in-progress", "completed"], {
   message: "Invalid status. Must be 'in-progress' or 'completed'.",
});
export type TodoStatus = z.infer<typeof TodoStatusEnum>;

export interface Claims {
   role: Role;
   email: string;
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

export interface TodoBasic {
   id: string;
   todo: string;
   status: TodoStatus;
   createdAt: Date;
}

export interface TodoAllData extends TodoBasic {
   userId: string;
   updatedAt: Date;
}
