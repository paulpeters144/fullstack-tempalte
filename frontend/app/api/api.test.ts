import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { LoginReq, PatchTodoReq, RegisterReq } from "~shared/src/req-res.types";
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
      const signUpRes = await api.auth.signup(signupData);
      if (signUpRes.isError) throw signUpRes.value;
      expect(signUpRes.value).toEqual({ message: "ok" });

      const loginData: LoginReq = {
         email: uniqueEmail,
         password: testPassword,
      };
      const loginRes = await api.auth.login(loginData);
      if (loginRes.isError) throw loginRes.value;
      expect(loginRes.value).toHaveProperty("accessToken");
      expect(typeof loginRes.value.accessToken).toBe("string");
      api.auth.setToken(loginRes.value.accessToken);

      const userRes = await api.auth.getUser();
      if (userRes.isError) throw userRes.value;
      expect(userRes.value).toHaveProperty("id");
      expect(userRes.value).toHaveProperty("email", uniqueEmail);
      expect(userRes.value).toHaveProperty("role", "user");
      expect(userRes.value).toHaveProperty("createdAt");
      expect(typeof userRes.value.id).toBe("string");
      expect(typeof userRes.value.createdAt).toBe("string");

      const deleteRes = await api.auth.deleteUser();
      if (deleteRes.isError) throw deleteRes.value;
      expect(deleteRes.value).toEqual({ message: "success" });
   });

   it("should fail login with incorrect password", async () => {
      // arrange
      const email = `testuser_${Date.now()}@example.com`;
      const password = "TestPassword123!";
      await api.auth
         .signup({ email, password, repassword: password, role: "user" })
         .then(() => api.auth.login({ email, password }))
         .then((res) => {
            if (res.isError) throw res.value;
            return res.value;
         })
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
         .then(() => api.auth.login(testUser))
         .then((res) => {
            if (res.isError) throw res.value;
            return res.value;
         })
         .then((res) => api.auth.setToken(res.accessToken));

      const res = await api.todo.create({
         todo: "Test Todo",
         status: "in-progress",
      });

      if (res.isError) throw res.value;

      expect(res.value.todoId).toBeDefined();
      createdTodoId = res.value.todoId;
   });

   afterAll(async () => {
      const { value, isError } = await api.auth.deleteUser();
      if (isError) throw value;

      expect(value.message).toBeTruthy();
   });

   it("get all todos", async () => {
      const { value, isError } = await api.todo.getAll();
      if (isError) throw value;
      const found = value.find((t) => t.id === createdTodoId);

      expect(found).toBeDefined();
   });

   it("get todo by id", async () => {
      const { value, isError } = await api.todo.getById(createdTodoId);
      if (isError) throw value;

      expect(value.id).toBe(createdTodoId);
   });

   it("patch todo", async () => {
      const patchPayload: PatchTodoReq = { status: "completed" };
      const { value, isError } = await api.todo.patch(createdTodoId, patchPayload);
      if (isError) throw value;

      expect(value.status).toBe(patchPayload.status);
   });

   it("delete todo", async () => {
      const { value, isError } = await api.todo.delete(createdTodoId);
      if (isError) throw value;

      expect(value.message).toBeDefined();
   });
});
