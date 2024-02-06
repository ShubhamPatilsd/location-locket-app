import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { AppRouter } from "./src/router";

export const transformer = superjson;
export { createContext } from "./src/context";
export type { Context } from "./src/context";
export { appRouter } from "./src/router";
export type { AppRouter } from "./src/router";
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
