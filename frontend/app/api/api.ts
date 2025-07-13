import { env } from "@/env";
import { secureCookie } from "@/util/cookie";
import log from "@/util/logger";
import type { TodoBasic, UserBasic } from "@shared/src/domain.types";
import type {
   AccessTokenRes,
   CreateTodoReq,
   CreateTodoRes,
   FriendlyErrorRes,
   LoginReq,
   PatchTodoReq,
   PatchTodoRes,
   RegisterReq,
   SimpleRes,
} from "@shared/src/req-res.types";

type Result<T> =
   | {
        value: T;
        isError: false;
        isFriendly: false;
     }
   | {
        value: Error;
        isError: true;
        isFriendly: false;
     }
   | {
        value: FriendlyErrorRes;
        isError: true;
        isFriendly: true;
     };

async function fetchData<T>(url: string, options?: RequestInit): Promise<Result<T>> {
   try {
      const response = await fetch(url, options);

      if (!response.ok) {
         const json = await response.json();

         const isFriendly =
            typeof json === "object" &&
            json !== null &&
            "error" in json &&
            typeof json.error === "string";

         if (isFriendly) {
            return {
               value: json.error as FriendlyErrorRes,
               isError: true,
               isFriendly: true,
            };
         }

         return {
            value: new Error(`HTTP Status: ${response.status} - ${json}`),
            isError: true,
            isFriendly: false,
         };
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
         const data = await response.json();
         return { value: data as T, isError: false, isFriendly: false };
      }

      return { value: {} as T, isError: false, isFriendly: false };
   } catch (e) {
      log.error(e);
      if (e instanceof Error) {
         return {
            value: e,
            isError: true,
            isFriendly: false,
         };
      }
      return {
         value: new Error("unknown error"),
         isError: true,
         isFriendly: false,
      };
   }
}

export const apiClient = (props: { baseUrl: string }) => {
   const { baseUrl } = props;
   let accessToken = tryGetAccessToken();

   return {
      auth: {
         signup: async (data: RegisterReq): Promise<Result<SimpleRes>> => {
            const res = await fetchData<SimpleRes>(`${baseUrl}/auth/signup`, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
            return res;
         },

         login: async (data: LoginReq): Promise<Result<AccessTokenRes>> => {
            const res = await fetchData<AccessTokenRes>(`${baseUrl}/auth/login`, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
            return res;
         },

         getUser: async (): Promise<Result<UserBasic>> => {
            const res = await fetchData<UserBasic>(`${baseUrl}/auth/user`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
            return res;
         },

         deleteUser: async (): Promise<Result<SimpleRes>> => {
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
         getAll: async (): Promise<Result<TodoBasic[]>> => {
            return fetchData<TodoBasic[]>(`${baseUrl}/todos`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
         },

         getById: async (todoId: string): Promise<Result<TodoBasic>> => {
            return fetchData<TodoBasic>(`${baseUrl}/todos/${todoId}`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
         },

         create: async (data: CreateTodoReq): Promise<Result<CreateTodoRes>> => {
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
         ): Promise<Result<PatchTodoRes>> => {
            return fetchData<PatchTodoRes>(`${baseUrl}/todos/${todoId}`, {
               method: "PATCH",
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
            });
         },

         delete: async (todoId: string): Promise<Result<SimpleRes>> => {
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

export const api = apiClient({ baseUrl: env.baseUrl });

function tryGetAccessToken() {
   try {
      return secureCookie.get("access");
   } catch (e) {
      log.error(e);
   }
   return "";
}
