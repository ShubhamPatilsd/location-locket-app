import express, { NextFunction, Request, Response } from "express";
import { authWebhook } from "./webhook";
import { verifyToken } from "@clerk/clerk-sdk-node";
import { prisma } from "./db";
import * as securePin from "secure-pin";

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

app.use("/api/webhooks/user", (req, res) => {
  authWebhook(req.body, req.headers)
    .then(({ code, msg }) => {
      res.status(code).json({ message: msg });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "webhook error" });
    });
});

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (token) next();
  else res.status(401).json({ message: "unauthorized" });
};

app.get("/me", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") as string;

  try {
    const jwt = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY as string,
      issuer: process.env.CLERK_ISSUER as string,
    });

    const user = await prisma.user.findUnique({
      where: { id: jwt.sub },
    });

    if (user) res.json(user);
    else res.status(404).json({ message: "user not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

app.post("/group/start", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") as string;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const jwt = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY as string,
      issuer: process.env.CLERK_ISSUER as string,
    });

    const user = await prisma.user.findUnique({
      where: { id: jwt.sub },
    });

    if (!user) return res.status(404).json({ message: "user not found" });

    const code = securePin.generatePinSync(8);

    const group = await prisma.group.create({
      data: {
        name,
        code: parseInt(code),
        users: { create: { userId: user.id } },
      },
    });

    return res.json(group);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

app.post("/group/join", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") as string;
  const { code } = req.body as { code: string };

  if (!code || code.trim() === "") {
    return res.status(400).json({ message: "code is required" });
  }

  try {
    const jwt = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY as string,
      issuer: process.env.CLERK_ISSUER as string,
    });

    const user = await prisma.user.findUnique({
      where: { id: jwt.sub },
    });

    if (!user) return res.status(404).json({ message: "user not found" });

    const group = await prisma.group.findUnique({
      where: { code: parseInt(code) },
    });

    if (!group) return res.status(404).json({ message: "group not found" });

    await prisma.group.update({
      where: { id: group.id },
      data: {
        users: {
          connectOrCreate: {
            where: { groupId_userId: { groupId: group.id, userId: user.id } },
            create: { userId: user.id },
          },
        },
      },
    });

    return res.json(group);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

app.listen(port, () => {
  return console.log(
    `Express server is listening at http://localhost:${port} 🚀`,
  );
});
