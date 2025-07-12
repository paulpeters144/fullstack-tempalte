import { parseWithZod } from "@conform-to/zod/v4";
import { loginSchema, registerSchema } from "@shared/src/req-res.types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const login = async (formData: FormData) => {
   const submission = parseWithZod(formData, { schema: loginSchema });
   await sleep(1500);
   if (submission.status !== "success") {
      return submission.reply();
   }

   console.log("Form submitted successfully:", submission.value);
   // handle api request here
   return null;
};

export const register = async (formData: FormData) => {
   const submission = parseWithZod(formData, { schema: registerSchema });
   await sleep(1500);
   if (submission.status !== "success") {
      return submission.reply();
   }

   console.log("Form submitted successfully:", submission.value);
   // handle api request here
   return null;
};

export const pageAction = {
   login,
   register,
};
