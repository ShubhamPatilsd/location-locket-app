import { appRouter, createContext } from "@memoir/api";
import { createNextApiHandler } from "@trpc/server/adapters/next";

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
