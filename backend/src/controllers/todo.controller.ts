import { di } from "@/src/util/di";
import { BadRequestError, getError } from "@/src/util/error";
import type { TodoItem } from "@shared/src/domain.types";
import {
   type CreateTodoReq,
   type CreateTodoRes,
   type PatchTodoReq,
   type PatchTodoRes,
   type SimpleRes,
   type TodoParams,
   createTodoSchema,
   patchTodoSchema,
   todoParamsSchema,
} from "@shared/src/req-res.types";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const todoController = (app: FastifyInstance) => {
   const secSvc = di.securitySvc();
   const ddb = di.ddbAccess();

   const getAllTodos = async (
      req: FastifyRequest,
      rep: FastifyReply,
   ): Promise<TodoItem[]> => {
      try {
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const userTodosKey = `USER#${claims.id}#TD`;

         const todos = await ddb.getItems<TodoItem>({
            itemKey: { pk: userTodosKey },
            startsWith: "",
         });

         return rep.send(todos || []);
      } catch (error) {
         return getError(rep, error);
      }
   };

   const getTodoById = async (
      req: FastifyRequest<{ Params: TodoParams }>,
      rep: FastifyReply,
   ): Promise<TodoItem> => {
      try {
         todoParamsSchema.parse(req.params);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoPk = `USER#${claims.id}#TD`;
         const todo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoPk, sk: req.params.id },
         });

         if (!todo) {
            throw new BadRequestError(`Todo not found: ${req.params.id}`);
         }

         if (todo.userId !== claims.id) {
            throw new BadRequestError("Unauthorized to access this todo");
         }

         return rep.send(todo);
      } catch (error) {
         return getError(rep, error);
      }
   };

   const createTodo = async (
      req: FastifyRequest<{ Body: CreateTodoReq }>,
      rep: FastifyReply,
   ): Promise<CreateTodoRes> => {
      try {
         createTodoSchema.parse(req.body);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoId = crypto.randomUUID().replaceAll("-", "").slice(0, 25);
         const todoPk = `USER#${claims.id}#TD`;
         const now = new Date();

         await ddb.putItem<TodoItem>({
            key: { pk: todoPk, sk: todoId },
            item: {
               id: todoId,
               todo: req.body.todo,
               status: "in-progress",
               userId: claims.id,
               createdAt: now,
               updatedAt: now,
            },
         });

         return rep.send({ todoId });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const patchTodo = async (
      req: FastifyRequest<{ Body: PatchTodoReq; Params: TodoParams }>,
      rep: FastifyReply,
   ): Promise<PatchTodoRes> => {
      try {
         todoParamsSchema.parse(req.params);
         patchTodoSchema.parse(req.body);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoKey = `USER#${claims.id}#TD`;

         const existingTodo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoKey, sk: req.params.id },
         });

         if (!existingTodo) {
            throw new BadRequestError(`Todo not found: ${req.params.id}`);
         }

         if (existingTodo.userId !== claims.id) {
            throw new BadRequestError("Unauthorized to update this todo");
         }

         const updatedTodo: TodoItem = {
            ...existingTodo,
            todo: req.body.todo ?? existingTodo.todo,
            status: req.body.status ?? existingTodo.status,
            updatedAt: new Date(),
         };

         await ddb.putItem<TodoItem>({
            key: { pk: todoKey, sk: req.params.id },
            item: updatedTodo,
         });

         return rep.send({ ...updatedTodo });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const deleteTodo = async (
      req: FastifyRequest<{ Params: TodoParams }>,
      rep: FastifyReply,
   ): Promise<SimpleRes> => {
      try {
         todoParamsSchema.parse(req.params);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoKey = `USER#${claims.id}#TD`;

         const existingTodo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoKey, sk: req.params.id },
            pickKeys: ["id", "userId"],
         });

         if (!existingTodo) {
            throw new BadRequestError(`Todo not found: ${req.params.id}`);
         }

         if (existingTodo.userId !== claims.id) {
            throw new BadRequestError("Unauthorized to delete this todo");
         }

         await ddb.deleteItem({
            itemKey: { pk: todoKey, sk: req.params.id },
         });

         return rep.send({ message: "Todo deleted successfully" });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const authorize = async (req: FastifyRequest, reply: FastifyReply) => {
      if (req.url.match("/todo")) {
         try {
            const hashJwt = req.headers.authorization?.split("Bearer ")[1];
            if (!secSvc.validJwt(hashJwt)) {
               reply.code(401).send({ message: "Unauthorized" });
            }
         } catch (error) {
            console.error(JSON.stringify(error));
            reply.code(401).send({ message: "Unauthorized" });
         }
      }
   };

   app.addHook("onRequest", authorize);

   app.get("/api/todos", getAllTodos);
   app.get("/api/todos/:id", getTodoById);
   app.post("/api/todos", createTodo);
   app.patch("/api/todos/:id", patchTodo);
   app.delete("/api/todos/:id", deleteTodo);
};
