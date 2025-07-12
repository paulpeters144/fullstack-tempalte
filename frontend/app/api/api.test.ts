import type {
   CreateTodoReq,
   LoginReq,
   PatchTodoReq,
   RegisterReq,
} from "@shared/src/req-res.types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiClient } from "./api";

const BASE_URL = "http://localhost:3000/api";
const api = apiClient({ baseUrl: BASE_URL });

describe("Auth API Integration Tests", () => {
   it("should successfully complete the full authentication flow", async () => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";
      const signupData: RegisterReq = {
         email: uniqueEmail,
         password: testPassword,
         repassword: testPassword,
         role: "user",
      };
      const signupRes = await api.auth.signup(signupData);
      expect(signupRes).toEqual({ message: "ok" });

      const loginData: LoginReq = {
         email: uniqueEmail,
         password: testPassword,
      };
      const loginRes = await api.auth.login(loginData);
      expect(loginRes).toHaveProperty("accessToken");
      expect(typeof loginRes.accessToken).toBe("string");
      api.auth.setToken(loginRes.accessToken);

      const userRes = await api.auth.getUser();
      expect(userRes).toHaveProperty("id");
      expect(userRes).toHaveProperty("email", uniqueEmail);
      expect(userRes).toHaveProperty("role", "user");
      expect(userRes).toHaveProperty("createdAt");
      expect(typeof userRes.id).toBe("string");
      expect(typeof userRes.createdAt).toBe("string");

      const deleteRes = await api.auth.deleteUser();
      expect(deleteRes).toEqual({ message: "success" });
   });

   it("should fail login with incorrect password", async () => {
      // arrange
      const email = `testuser_${Date.now()}@example.com`;
      const password = "TestPassword123!";
      await api.auth
         .signup({ email, password, repassword: password, role: "user" })
         .then(() => api.auth.login({ email, password }))
         .then((res) => api.auth.setToken(res.accessToken));

      try {
         // act
         await api.auth.login({
            email: email,
            password: "BadPwd123",
         });
      } catch (error) {
         if (error instanceof Error) {
            // assert
            expect(error.message).toContain("password");
         } else {
            throw error;
         }
      }

      // clean up
      await api.auth.deleteUser();
   });
});

describe("Todo API integration", () => {
   let createdTodoId: string;

   const testUser: RegisterReq = {
      email: `testuser+${Date.now()}@example.com`,
      password: "password123",
      repassword: "password123",
      role: "user",
   };

   beforeAll(async () => {
      await api.auth
         .signup(testUser)
         .then(() => api.auth.login({ ...testUser }))
         .then((res) => api.auth.setToken(res.accessToken));

      const createPayload: CreateTodoReq = {
         todo: "Test Todo",
         status: "in-progress",
      };
      const res = await api.todo.create(createPayload);
      expect(res.todoId).toBeDefined();
      createdTodoId = res.todoId;
   });

   afterAll(async () => {
      const res = await api.auth.deleteUser();
      expect(res.message).toBeTruthy();
   });

   it("get all todos", async () => {
      const todos = await api.todo.getAll();
      const found = todos.find((t) => t.id === createdTodoId);
      expect(found).toBeDefined();
   });

   it("get todo by id", async () => {
      const todo = await api.todo.getById(createdTodoId);
      expect(todo.id).toBe(createdTodoId);
   });

   it("patch todo", async () => {
      const patchPayload: PatchTodoReq = { status: "completed" };
      const res = await api.todo.patch(createdTodoId, patchPayload);
      expect(res.status).toBe(patchPayload.status);
   });

   it("delete todo", async () => {
      const res = await api.todo.delete(createdTodoId);
      expect(res.message).toBeDefined();
   });
});
