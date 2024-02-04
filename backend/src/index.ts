// import bodyParser from "body-parser";
// import express from "express";
// import { apiRouter } from "./src/api/index.ts.bak";
// import logRequest from "./src/middleware/logger";

// const app = express();

// app.use(bodyParser.json());
// app.use(logRequest);

// app.use((req, res, next) => {
//   // Website you wish to allow to connect
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   // Request methods you wish to allow
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

//   // Request headers you wish to allow
//   res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

//   // Pass to next layer of middleware
//   next();
// });

// app.use("/api", apiRouter);

// app.get("/", (req, res) => {
//   res.status(200).send({ message: "memoir-api is running!" });
// });

// const PORT = process.env.PORT || 5000;

// try {
//   app.listen(PORT, () => {
//     console.log(`Server is running @ http://127.0.0.1:${PORT}`);
//   });
// } catch (err) {
//   console.log("[ERROR] Unexpected error", err);
// }

import express, { Router as ExpressRouter } from "express";
import * as trpcExpressAdpater from "@trpc/server/adapters/express";
import cors from "cors";

import { appRouter } from "./api/src/router/index";
import { createContext } from "./api/src/context";

const expressRouter = ExpressRouter();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  "/",
  trpcExpressAdpater.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use(expressRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port: " + (process.env.PORT || 3000));
});

export type { AppRouter } from "./api/src/router/index";
export { appRouter } from "./api/src/router/index";

export { createContext } from "./api/src/context";
export type { Context } from "./api/src/context";
