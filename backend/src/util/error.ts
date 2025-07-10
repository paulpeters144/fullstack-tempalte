import type { FriendlyError } from "@shared/types";
import { type ModelErrors, zodErrorMessages } from "@shared/validation";
import type { FastifyError, FastifyReply } from "fastify";
import { ZodError } from "zod";

function isFastifyError(obj: unknown): boolean {
   if (!(obj instanceof Error)) return false;
   const error = obj as FastifyError;
   if (!error.code) return false;
   if (!error.name) return false;
   if (!error.statusCode) return false;
   return true;
}

function handleFastifyError(reply: FastifyReply, error: FastifyError) {
   const message: FriendlyError = { error: error.message };
   return reply.code(error.statusCode || 500).send(message);
}

export const getError = (reply: FastifyReply, error: unknown): FastifyReply => {
   try {
      if (error instanceof ZodError) {
         const err = zodErrorMessages(error);
         const message: ModelErrors<unknown> = { error: err.model };
         return reply.code(400).send(message);
      }
      if (error instanceof BadRequestError) {
         const message: FriendlyError = { error: error.message };
         return reply.code(400).send(message);
      }
      if (isFastifyError(error)) {
         const fastifyError = error as FastifyError;
         return handleFastifyError(reply, fastifyError);
      }
   } catch (error) {
      console.error(error);
   }

   const message: FriendlyError = { error: "Internal Server Error" };
   return reply.code(500).send(message);
};

export class BadRequestError extends Error {
   constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
   }
}
