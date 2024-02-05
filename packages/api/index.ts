import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./src/router";

export { createContext, createExpressContext } from "./src/context";
export type { Context } from "./src/context";
export { appRouter } from "./src/router";
export type { AppRouter } from "./src/router";
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
