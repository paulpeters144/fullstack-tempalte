import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";

export const meta: MetaFunction = () => {
   return [
      { title: "Simple ToDo" },
      { name: "description", content: "Welcome to the ToDo App!" },
   ];
};

export default function Index() {
   const [isLogin, setIsLogin] = useState(true);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [repassword, setRepassword] = useState("");

   const handleSubmit = (e: { preventDefault: () => void }) => {
      e.preventDefault();

      if (isLogin) {
         console.log("Login attempt:", { email, password });
      } else {
         if (password !== repassword) {
            alert("Passwords do not match!");
            return;
         }
         console.log("Register attempt:", { email, password, repassword });
      }
      setEmail("");
      setPassword("");
      setRepassword("");
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
         <div className="bg-white p-8 rounded-lg border-2 border-gray-400 w-full max-w-md">
            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
               Simple ToDo
            </h1>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
               {isLogin ? "Sign In" : "Register"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label
                     htmlFor="email"
                     className="block text-sm font-medium text-gray-700 mb-1"
                  >
                     Email
                  </label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                     placeholder="you@example.com"
                  />
               </div>

               <div>
                  <label
                     htmlFor="password"
                     className="block text-sm font-medium text-gray-700 mb-1"
                  >
                     Password
                  </label>
                  <input
                     type="password"
                     id="password"
                     name="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                     placeholder="••••••••"
                  />
               </div>

               {!isLogin && (
                  <div>
                     <label
                        htmlFor="repassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                     >
                        Re-enter Password
                     </label>
                     <input
                        type="password"
                        id="repassword"
                        name="repassword"
                        value={repassword}
                        onChange={(e) => setRepassword(e.target.value)}
                        required={!isLogin}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                        placeholder="••••••••"
                     />
                  </div>
               )}

               <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition duration-150 ease-in-out"
               >
                  {isLogin ? "Sign In" : "Register"}
               </button>
            </form>

            <div className="mt-6 text-center">
               <p className="text-sm text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                     onClick={() => setIsLogin(!isLogin)}
                     className="font-medium text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 rounded-md transition duration-150 ease-in-out"
                  >
                     {isLogin ? "Register here" : "Sign In here"}
                  </button>
               </p>
            </div>
         </div>
      </div>
   );
}
