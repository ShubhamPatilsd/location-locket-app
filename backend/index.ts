import bodyParser from "body-parser";
import express from "express";
import { apiRouter } from "./src/api/index";
import logRequest from "./src/middleware/logger";

const app = express();

app.use(bodyParser.json());
app.use(logRequest);

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Pass to next layer of middleware
  next();
});

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.status(200).send({ message: "memoir-api is running!" });
});

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log(`Server is running @ http://127.0.0.1:${PORT}`);
  });
} catch (err) {
  console.log("[ERROR] Unexpected error", err);
}
