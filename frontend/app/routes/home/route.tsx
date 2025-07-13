import { type SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { Link, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { z } from "zod";
import { api } from "~/api/api";
import { secureCookie } from "~/util/cookie";
import { type CreateTodoReq, createTodoSchema } from "~shared/src/req-res.types";
const updateTodoStatusSchema = z.object({
   id: z.string(),
   status: z.enum(["in-progress", "completed"]),
   _action: z.literal("update-status"),
});

const removeTodoSchema = z.object({
   id: z.string(),
   _action: z.literal("remove"),
});

export async function clientLoader() {
   const claims = secureCookie.claims();
   if (!claims.email) {
      return redirect("/?form=signin");
   }
   const { value, isError } = await api.todo.getAll();
   if (isError) throw value;
   return value;
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
   const formData = await request.formData();
   const action = formData.get("_action");

   if (action === "update-status") {
      const submission = parseWithZod(formData, { schema: updateTodoStatusSchema });

      if (submission.status !== "success") {
         return submission.reply();
      }

      const { id, status } = submission.value;
      const response = await api.todo.patch(id, { status });
      if (response.isError) throw response.value;

      return response.value;
   }

   if (action === "remove") {
      const submission = parseWithZod(formData, { schema: removeTodoSchema });

      if (submission.status !== "success") {
         return submission.reply();
      }

      const { id } = submission.value;
      const response = await api.todo.delete(id);
      if (response.isError) throw response.value;

      return null;
   }

   const submission = parseWithZod(formData, { schema: createTodoSchema });

   if (submission.status !== "success") {
      const reply = submission.reply();
      return reply;
   }

   const { todo, status } = submission.value as CreateTodoReq;
   const response = await api.todo.create({ todo, status });
   if (response.isError) throw response.value;

   return null;
}

export default function TodosPage() {
   const todos = useLoaderData<typeof clientLoader>();
   const fetcher = useFetcher<typeof clientAction>();
   const statusFetcher = useFetcher<typeof clientAction>();
   const removeFetcher = useFetcher<typeof clientAction>();

   const [form, fields] = useForm({
      id: "todo-form",
      lastResult: isSubmission(fetcher.data) ? fetcher.data : undefined,
      shouldValidate: "onSubmit",
      onValidate({ formData }) {
         return parseWithZod(formData, { schema: createTodoSchema });
      },
   });

   const getStatusBadge = (status: string) => {
      switch (status) {
         case "completed":
            return "bg-green-100 text-green-800";
         case "in-progress":
            return "bg-blue-100 text-blue-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   useEffect(() => {
      if (fetcher.state === "idle") form.reset();
   }, [fetcher.state]);

   useEffect(() => {
      fetcher.load("/home");
   }, []);

   return (
      <div className="min-h-screen bg-gray-50 p-6">
         <header className="max-w-3xl mx-auto flex items-center justify-between p-4 border-2 rounded-md border-gray-500 mb-8">
            <div className="text-2xl font-bold text-blue-700 tracking-tight">
               ToDo
            </div>
            <Link
               to="/signout"
               className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
            >
               Sign Out
            </Link>
         </header>

         <main className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-8">
            <h1 className="text-2xl font-semibold text-gray-800">List 1</h1>

            <div className="max-h-[30rem] overflow-y-auto space-y-3">
               {todos.map((todo) => (
                  <div
                     key={todo.id}
                     className="flex justify-between items-start border rounded-lg px-4 py-3 bg-gray-50 shadow-sm"
                  >
                     <div className="flex-1">
                        <p
                           className={`font-medium ${todo.status === "completed" ? "line-through text-gray-500" : "text-gray-800"}`}
                        >
                           {todo.todo}
                        </p>
                        <span
                           className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(todo.status)}`}
                        >
                           {todo.status}
                        </span>
                     </div>

                     <div className="flex gap-2 ml-4 items-start">
                        <statusFetcher.Form method="post" action="/home">
                           <input
                              type="hidden"
                              name="_action"
                              value="update-status"
                           />
                           <input type="hidden" name="id" value={todo.id} />
                           <select
                              name="status"
                              defaultValue={todo.status}
                              onChange={(e) => {
                                 const form = e.target.closest("form");
                                 if (form) {
                                    statusFetcher.submit(form);
                                 }
                              }}
                              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white shadow-sm"
                           >
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                           </select>
                        </statusFetcher.Form>

                        <removeFetcher.Form method="post" action="/home">
                           <input type="hidden" name="_action" value="remove" />
                           <input type="hidden" name="id" value={todo.id} />
                           <button
                              type="submit"
                              title="Remove todo"
                              className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-100"
                           >
                              ✕
                           </button>
                        </removeFetcher.Form>
                     </div>
                  </div>
               ))}
            </div>

            <fetcher.Form
               method="post"
               action="/home"
               id={form.id}
               onSubmit={form.onSubmit}
               className="space-y-4"
            >
               <div>
                  <label
                     htmlFor={fields.todo.id}
                     className="block text-sm font-medium text-gray-700 mb-1"
                  >
                     New Todo
                  </label>
                  <input
                     name={fields.todo.name}
                     id={fields.todo.id}
                     type="text"
                     defaultValue={fields.todo.defaultValue}
                     className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {fields.todo.errors && (
                     <p className="text-sm text-red-600 mt-1">
                        {fields.todo.errors[0]}
                     </p>
                  )}
               </div>

               <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow"
               >
                  Add Todo
               </button>
            </fetcher.Form>
         </main>
      </div>
   );
}

export function isSubmission<T>(data: unknown): data is SubmissionResult<T> {
   if (typeof data !== "object") return false;
   if (data === null) return false;
   if (!("status" in data)) return false;

   const result = data as Record<string, unknown>;
   if (result.status !== "error") return false;

   return true;
}
