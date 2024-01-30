import express from "express";
import { authRouter } from "./auth";
import { dataRouter } from "./data";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/data", dataRouter);

export { router as apiRouter };
