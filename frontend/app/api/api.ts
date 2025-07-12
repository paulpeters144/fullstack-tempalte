import type { TodoItem, UserBasic } from "@shared/src/domain.types";
import type {
   AccessTokenRes,
   CreateTodoReq,
   CreateTodoRes,
   LoginReq,
   PatchTodoReq,
   PatchTodoRes,
   RegisterReq,
   SimpleRes,
} from "@shared/src/req-res.types";

async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
   const response = await fetch(url, options);

   if (!response.ok) {
      let errorMessage = `HTTP Status: ${response.status}`;
      try {
         const json = await response.json();
         if (json.error) {
            errorMessage = json.error;
         }
      } catch (_) {}
      throw new Error(errorMessage);
   }

   const contentType = response.headers.get("content-type");
   if (contentType?.includes("application/json")) {
      return response.json() as Promise<T>;
   }
   return {} as T;
}

export const apiClient = (props: { baseUrl: string }) => {
   const { baseUrl } = props;

   return {
      auth: {
         signup: async (data: RegisterReq): Promise<SimpleRes> => {
            const res = await fetchData<SimpleRes>(`${baseUrl}/auth/signup`, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
            return res;
         },

         login: async (data: LoginReq): Promise<AccessTokenRes> => {
            const res = await fetchData<AccessTokenRes>(`${baseUrl}/auth/login`, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
            return res;
         },

         getUser: async (token: string): Promise<UserBasic> => {
            const res = await fetchData<UserBasic>(`${baseUrl}/auth/user`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
            });
            return res;
         },

         deleteUser: async (token: string): Promise<SimpleRes> => {
            const res = await fetchData<SimpleRes>(`${baseUrl}/auth/user`, {
               method: "DELETE",
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            return res;
         },
      },
      todo: {
         getAll: async (token: string): Promise<TodoItem[]> => {
            return fetchData<TodoItem[]>(`${baseUrl}/todos`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
            });
         },

         getById: async (token: string, todoId: string): Promise<TodoItem> => {
            return fetchData<TodoItem>(`${baseUrl}/todos/${todoId}`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
            });
         },

         create: async (
            token: string,
            data: CreateTodoReq,
         ): Promise<CreateTodoRes> => {
            return fetchData<CreateTodoRes>(`${baseUrl}/todos`, {
               method: "POST",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
         },

         patch: async (
            token: string,
            todoId: string,
            data: PatchTodoReq,
         ): Promise<PatchTodoRes> => {
            return fetchData<PatchTodoRes>(`${baseUrl}/todos/${todoId}`, {
               method: "PATCH",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
         },

         delete: async (token: string, todoId: string): Promise<SimpleRes> => {
            return fetchData<SimpleRes>(`${baseUrl}/todos/${todoId}`, {
               method: "DELETE",
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
         },
      },
   };
};

const BASE_URL = "http://localhost:3000/api";
export const api = apiClient({ baseUrl: BASE_URL });
