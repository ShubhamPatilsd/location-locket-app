import express from "express";
import { authWebhook } from "../webhook";

const app = express();
const port = process.env.PORT || 5000;

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
