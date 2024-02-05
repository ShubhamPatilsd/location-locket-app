import {
  decodeJwt,
  signedInAuthObject,
  signedOutAuthObject,
} from "@clerk/clerk-sdk-node";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/api";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@memoir/db";
import { type CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type AuthContextProps = {
  auth: SignedInAuthObject | SignedOutAuthObject;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
export const createContextInner = async ({ auth }: AuthContextProps) => {
  return { auth, prisma };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  return await createContextInner({ auth: getAuth(opts.req) });
};

const parseJwt = (req: CreateExpressContextOptions["req"]) => {
  const headerToken = req.headers.authorization?.replace("Bearer ", "");
  return decodeJwt(headerToken || "");
};

export const createExpressContext = ({ req }: CreateExpressContextOptions) => {
  const options = {
    secretKey: process.env.SECRET_KEY,
    apiUrl: "https://api.clerk.com",
    apiVersion: "v1",
    authStatus: req.headers["authStatus"],
    authMessage: req.headers["authMessage"],
    authReason: req.headers["authReason"],
  };

  let auth: SignedInAuthObject | SignedOutAuthObject;

  try {
    const jwt = parseJwt(req);
    auth = signedInAuthObject(jwt.payload, { ...options, token: jwt.raw.text });
  } catch (error) {
    auth = signedOutAuthObject(options);
  }

  return createContextInner({ auth });
};

export type Context = Awaited<typeof createContext>;
