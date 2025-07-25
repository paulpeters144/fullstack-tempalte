import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { clientAction } from "~/routes/_index/route";
import { loginSchema } from "~shared/src/req-res.types";

interface LoginFormProps {
   onToggleRegister: () => void;
}

export function LoginForm({ onToggleRegister }: LoginFormProps) {
   const actionData = useActionData<typeof clientAction>();
   const navigation = useNavigation();

   const [form, fields] = useForm({
      id: "login-form",
      lastResult: actionData,
      shouldValidate: "onBlur",
      onValidate({ formData }) {
         return parseWithZod(formData, { schema: loginSchema });
      },
   });

   const isSubmitting = navigation.state === "submitting";

   return (
      <>
         <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Sign In
         </h2>

         <Form method="POST" id={form.id} onSubmit={form.onSubmit}>
            <input type="hidden" name="id" value={form.id} />
            <div>
               <label
                  htmlFor={fields.email.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
               >
                  Email
               </label>
               <input
                  type="text"
                  id={fields.email.id}
                  name={fields.email.name}
                  defaultValue={fields.email.value}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                  placeholder="you@example.com"
               />
               {fields.email.errors && (
                  <p className="text-sm text-red-600 mt-1">
                     {fields.email.errors[0]}
                  </p>
               )}
            </div>

            <div className="my-5">
               <label
                  htmlFor={fields.password.id}
                  className="block text-sm font-medium text-gray-700"
               >
                  Password
               </label>
               <input
                  type="password"
                  id={fields.password.id}
                  name={fields.password.name}
                  defaultValue={fields.password.value}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                  placeholder="••••••••"
               />
               {fields.password.errors && (
                  <p className="text-sm text-red-600 mt-1">
                     {fields.password.errors[0]}
                  </p>
               )}
            </div>

            <button
               type="submit"
               disabled={isSubmitting}
               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition duration-150 ease-in-out disabled:opacity-50"
            >
               {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
         </Form>

         <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
               Don't have an account?{" "}
               <button
                  onClick={onToggleRegister}
                  className="font-medium text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 rounded-md transition duration-150 ease-in-out"
               >
                  Register here
               </button>
            </p>
         </div>
      </>
   );
}
