import { api } from "@/api/api";
import { secureCookie } from "@/util/cookie";
import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "@remix-run/react";
import { loginSchema, registerSchema } from "@shared/src/req-res.types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const login = async (formData: FormData) => {
   const submission = parseWithZod(formData, { schema: loginSchema });
   if (submission.status !== "success") {
      return submission.reply();
   }

   const { email, password } = submission.value;
   const loginRes = await api.auth.login({ email, password });

   if (loginRes.isError) {
      return null;
   }

   secureCookie.set("access", loginRes.value.accessToken);
   secureCookie.set("email", email);
   api.auth.setToken(loginRes.value.accessToken);

   return redirect("/home");
};

export const register = async (formData: FormData) => {
   const submission = parseWithZod(formData, { schema: registerSchema });
   if (submission.status !== "success") {
      return submission.reply();
   }
   const { email, password, repassword, role } = submission.value;
   const signupRes = await api.auth.signup({ email, password, repassword, role });

   if (signupRes.isError) {
      return null;
   }

   return redirect("/?form=signin");
};

export const pageAction = {
   login,
   register,
};
