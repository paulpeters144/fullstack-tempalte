import { pageAction } from "@/routes/_index/actions";
import { LoginForm } from "@/routes/_index/components/Login";
import { RegisterForm } from "@/routes/_index/components/Register";
import type { MetaFunction } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { useState } from "react";

export const meta: MetaFunction = () => {
   return [
      { title: "Simple ToDo" },
      { name: "description", content: "Welcome to the ToDo App!" },
   ];
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
   const formData = await request.formData();
   const id = formData.get("id");

   if (!id) throw new Error("the for id is not set");

   if (id === "login-form") return pageAction.login(formData);
   if (id === "register-form") return pageAction.register(formData);

   throw new Error("undefine form for action");
};

export default function Index() {
   const [isLogin, setIsLogin] = useState(true);

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
         <div className="bg-white p-8 rounded-lg border-2 border-gray-400 w-full max-w-md">
            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
               Simple ToDo
            </h1>

            {isLogin ? (
               <LoginForm onToggleRegister={() => setIsLogin(false)} />
            ) : (
               <RegisterForm onToggleSignIn={() => setIsLogin(true)} />
            )}
         </div>
      </div>
   );
}
