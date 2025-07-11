import { di } from "@/src/util/di";
import { BadRequestError, getError } from "@/src/util/error";
import {
   type CreateTodoRequest,
   CreateTodoSchema,
   type SimpleResponse,
   type TodoItem,
   type TodoParams,
   TodoParamsSchema,
   type UpdateTodoRequest,
   UpdateTodoSchema,
} from "@shared/src/types";
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
         TodoParamsSchema.parse(req.params);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoKey = `USER#${claims.id}#TD#${req.params.id}`;
         const todo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoKey, sk: todoKey },
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
      req: FastifyRequest<{ Body: CreateTodoRequest }>,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         CreateTodoSchema.parse(req.body);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoId = crypto.randomUUID().replaceAll("-", "").slice(0, 25);
         const todoKey = `USER#${claims.id}#TD#${todoId}`;
         const now = new Date();

         await ddb.putItem<TodoItem>({
            key: { pk: todoKey, sk: todoKey },
            item: {
               id: todoId,
               title: req.body.title,
               description: req.body.description,
               status: "pending",
               priority: req.body.priority,
               userId: claims.id,
               createdAt: now,
               updatedAt: now,
               dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
            },
         });

         return rep.send({ message: "Todo created successfully" });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const updateTodo = async (
      req: FastifyRequest<{ Body: UpdateTodoRequest }>,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         UpdateTodoSchema.parse(req.body);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoKey = `USER#${claims.id}#TD#${req.body.id}`;

         const existingTodo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoKey, sk: todoKey },
         });

         if (!existingTodo) {
            throw new BadRequestError(`Todo not found: ${req.body.id}`);
         }

         if (existingTodo.userId !== claims.id) {
            throw new BadRequestError("Unauthorized to update this todo");
         }

         const updatedTodo: TodoItem = {
            ...existingTodo,
            title: req.body.title ?? existingTodo.title,
            description: req.body.description ?? existingTodo.description,
            status: req.body.status ?? existingTodo.status,
            priority: req.body.priority ?? existingTodo.priority,
            dueDate: req.body.dueDate
               ? new Date(req.body.dueDate)
               : existingTodo.dueDate,
            updatedAt: new Date(),
         };

         await ddb.putItem<TodoItem>({
            key: { pk: todoKey, sk: todoKey },
            item: updatedTodo,
         });

         return rep.send({ message: "Todo updated successfully" });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const patchTodo = async (
      req: FastifyRequest<{ Params: TodoParams; Body: Partial<UpdateTodoRequest> }>,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         TodoParamsSchema.parse(req.params);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoKey = `USER#${claims.id}#TD#${req.params.id}`;

         const existingTodo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoKey, sk: todoKey },
         });

         if (!existingTodo) {
            throw new BadRequestError(`Todo not found: ${req.params.id}`);
         }

         if (existingTodo.userId !== claims.id) {
            throw new BadRequestError("Unauthorized to update this todo");
         }

         const updatedTodo: TodoItem = {
            ...existingTodo,
            ...(req.body.title && { title: req.body.title }),
            ...(req.body.description !== undefined && {
               description: req.body.description,
            }),
            ...(req.body.status && { status: req.body.status }),
            ...(req.body.priority && { priority: req.body.priority }),
            ...(req.body.dueDate && { dueDate: new Date(req.body.dueDate) }),
            updatedAt: new Date(),
         };

         await ddb.putItem<TodoItem>({
            key: { pk: todoKey, sk: todoKey },
            item: updatedTodo,
         });

         return rep.send({ message: "Todo updated successfully" });
      } catch (error) {
         return getError(rep, error);
      }
   };

   const deleteTodo = async (
      req: FastifyRequest<{ Params: TodoParams }>,
      rep: FastifyReply,
   ): Promise<SimpleResponse> => {
      try {
         TodoParamsSchema.parse(req.params);
         const hashJwt = req.headers.authorization?.split("Bearer ")[1] || "";
         const claims = secSvc.getClaims(hashJwt);

         const todoKey = `USER#${claims.id}#TD#${req.params.id}`;

         const existingTodo = await ddb.getItem<TodoItem>({
            itemKey: { pk: todoKey, sk: todoKey },
            pickKeys: ["id", "userId"],
         });

         if (!existingTodo) {
            throw new BadRequestError(`Todo not found: ${req.params.id}`);
         }

         if (existingTodo.userId !== claims.id) {
            throw new BadRequestError("Unauthorized to delete this todo");
         }

         await ddb.deleteItem({
            itemKey: { pk: todoKey, sk: todoKey },
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
   app.put("/api/todos", updateTodo);
   app.patch("/api/todos/:id", patchTodo);
   app.delete("/api/todos/:id", deleteTodo);
};
