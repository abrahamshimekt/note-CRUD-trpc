import cors from "cors";
import express from "express";
import morgan from "morgan";
import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { PrismaClient } from "@prisma/client";

import {
  createNoteSchema,
  filterQuery,
  params,
  updateNoteSchema,
} from "./note.schema";

import {
  createNoteController,
  deleteNoteController,
  findAllNotesController,
  findNoteController,
  updateNoteController,
} from "./note.controller";
import { error } from "console";

export const prisma = new PrismaClient();
const t = initTRPC.create();
const appRouter = t.router({
  getHello: t.procedure.query((req) => {
    return { message: "welcome " };
  }),
  createNote: t.procedure
    .input(createNoteSchema)
    .mutation(({ input }) => createNoteController({ input })),
  updateNote: t.procedure
    .input(updateNoteSchema)
    .mutation(({ input }) =>
      updateNoteController({ paramsInput: input.params, input: input.body })
    ),
  deleteNote: t.procedure
    .input(params)
    .mutation(({ input }) => deleteNoteController({ paramsInput: input })),
  getNote: t.procedure
    .input(params)
    .mutation(({ input }) => findNoteController({ paramsInput: input })),
  getNotes: t.procedure
    .input(filterQuery)
    .mutation(({ input }) => findAllNotesController({ filterQuery: input })),
});

export type AppRouter = typeof appRouter;
const app = express();

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    Credential: true,
  })
);
app.use(
  "/api/trpc",trpcExpress.createExpressMiddleware(
    {
      router:appRouter
    }
  )
)
const port =8080;
app.listen(port).then(()=>{console.log(`🚀 Server listening on port ${port}`)}).catch((error)=>{console.log(error);});