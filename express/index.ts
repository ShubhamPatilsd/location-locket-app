import { verifyToken } from "@clerk/clerk-sdk-node";
import express, { NextFunction, Request, Response } from "express";
import * as securePin from "secure-pin";
import { Group, GroupToUser, User, prisma } from "./db";
import { authWebhook } from "./webhook";

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

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "") as string;

  const jwt = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY as string,
    issuer: process.env.CLERK_ISSUER as string,
  });

  const user = await prisma.user.findUnique({
    where: { id: jwt.sub },
  });

  if (!user) return res.status(404).json({ message: "user not found" });

  req.user = user;
  return next();
};

app.get("/me", authMiddleware, async (req, res) => {
  return res.json(req.user);
});

app.post("/group/start", authMiddleware, async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const code = securePin.generatePinSync(8);
    const group = await prisma.group.create({
      data: {
        name,
        code: parseInt(code),
        users: { create: { userId: req.user.id } },
      },
    });

    return res.json(group);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

app.post("/group/join", authMiddleware, async (req, res) => {
  const { code } = req.body as { code: string };

  if (!code || code.trim() === "") {
    return res.status(400).json({ message: "code is required" });
  }

  try {
    const group = await prisma.group.findUnique({
      where: { code: parseInt(code) },
    });

    if (!group) return res.status(404).json({ message: "group not found" });

    await prisma.group.update({
      where: { id: group.id },
      data: {
        users: {
          connectOrCreate: {
            where: {
              groupId_userId: { groupId: group.id, userId: req.user.id },
            },
            create: { userId: req.user.id },
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

app.get("/group/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { users: { include: { user: true } } },
    });

    if (!group) return res.status(404).json({ message: "group not found" });

    return res.json(group as Group & { users: { user: User }[] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

app.get("/groups", authMiddleware, async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: { users: { some: { userId: req.user.id } } },
      select: { id: true, name: true },
    });

    return res.json(groups);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

app.post("/location", authMiddleware, async (req, res) => {
  const { latitude, longitude } = req.body as {
    latitude: number;
    longitude: number;
  };

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "latitude and longitude are required" });
  }

  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        location: {
          upsert: {
            create: { latitude, longitude },
            update: { latitude, longitude },
          },
        },
      },
    });

    return res.status(200);
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
