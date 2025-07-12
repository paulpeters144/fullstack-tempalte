import { environment } from "@/environment";
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
   let accessToken = "";

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

         getUser: async (): Promise<UserBasic> => {
            const res = await fetchData<UserBasic>(`${baseUrl}/auth/user`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
            });
            return res;
         },

         deleteUser: async (): Promise<SimpleRes> => {
            const res = await fetchData<SimpleRes>(`${baseUrl}/auth/user`, {
               method: "DELETE",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
            return res;
         },
         setToken: (token: string) => {
            accessToken = token;
         },
      },
      todo: {
         getAll: async (): Promise<TodoItem[]> => {
            return fetchData<TodoItem[]>(`${baseUrl}/todos`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
            });
         },

         getById: async (todoId: string): Promise<TodoItem> => {
            return fetchData<TodoItem>(`${baseUrl}/todos/${todoId}`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
            });
         },

         create: async (data: CreateTodoReq): Promise<CreateTodoRes> => {
            return fetchData<CreateTodoRes>(`${baseUrl}/todos`, {
               method: "POST",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
         },

         patch: async (
            todoId: string,
            data: PatchTodoReq,
         ): Promise<PatchTodoRes> => {
            return fetchData<PatchTodoRes>(`${baseUrl}/todos/${todoId}`, {
               method: "PATCH",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
         },

         delete: async (todoId: string): Promise<SimpleRes> => {
            return fetchData<SimpleRes>(`${baseUrl}/todos/${todoId}`, {
               method: "DELETE",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
         },
      },
   };
};

export const api = apiClient({ baseUrl: environment.baseUrl });
