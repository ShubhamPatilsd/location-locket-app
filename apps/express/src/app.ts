import { appRouter, createContext } from "@memoir/api";
import { authWebhook } from "@memoir/webhook";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";

const app = express();
const port = process.env.PORT || 5000;

app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext }),
);

app.use("/api/webhooks/user", express.json(), (req, res) => {
  authWebhook(req.body, req.headers)
    .then(({ code, msg }) => {
      res.status(code).json({ message: msg });
    })
    .catch(() => {
      res.status(500).json({ message: "webhook error" });
    });
});

app.listen(port, () => {
  return console.log(
    `Express server is listening at http://localhost:${port} 🚀`,
  );
});
