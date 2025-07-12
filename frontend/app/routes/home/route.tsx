import { type SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { type CreateTodoReq, createTodoSchema } from "@shared/src/req-res.types";

export async function clientLoader() {
   return [
      { id: "1", todo: "Learn Remix", status: "in-progress" },
      { id: "2", todo: "Build a todo app", status: "done" },
   ];
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
   const formData = await request.formData();
   const submission = parseWithZod(formData, { schema: createTodoSchema });

   if (submission.status !== "success") {
      const reply = submission.reply();
      return reply;
   }

   const { todo, status } = submission.value as CreateTodoReq;
   const newId = Math.random().toString(36).substring(2, 8);

   return { todoId: newId };
}

export default function TodosRoute() {
   const todos = useLoaderData<typeof clientLoader>();
   const fetcher = useFetcher<typeof clientAction>();

   const [form, fields] = useForm({
      id: "todo-form",
      lastResult: isSubmission(fetcher.data) ? fetcher.data : undefined,
      shouldValidate: "onBlur",
      onValidate({ formData }) {
         return parseWithZod(formData, { schema: createTodoSchema });
      },
   });

   return (
      <div className="max-w-lg mx-auto space-y-8 p-4">
         <h1 className="text-2xl font-bold">Todos</h1>

         <ul className="space-y-2">
            {todos.map((todo) => (
               <li key={todo.id} className="border p-2 rounded">
                  <p>{todo.todo}</p>
                  <span className="text-sm text-gray-500">{todo.status}</span>
               </li>
            ))}
         </ul>

         <fetcher.Form
            method="post"
            id={form.id}
            onSubmit={form.onSubmit}
            className="space-y-4"
         >
            <div>
               <label htmlFor={fields.todo.id}>New Todo</label>
               <input
                  name={fields.todo.name}
                  id={fields.todo.id}
                  type="text"
                  defaultValue={fields.todo.defaultValue}
                  className="block w-full border px-2 py-1 rounded"
               />
               {fields.todo.errors && (
                  <p className="text-sm text-red-600">{fields.todo.errors[0]}</p>
               )}
            </div>

            <button
               type="submit"
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
               Add Todo
            </button>
         </fetcher.Form>
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
