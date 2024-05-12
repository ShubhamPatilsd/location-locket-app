import { verifyToken } from "@clerk/clerk-sdk-node";
import express, { NextFunction, Request, Response } from "express";
import * as securePin from "secure-pin";
import { prisma } from "./db";
import { authWebhook } from "./webhook";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(express.json({ limit: "50mb" }));
const port = process.env.PORT || 5000;

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

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
      include: {
        users: { include: { user: { include: { location: true } } } },
        posts: {
          include: {
            location: true,
            author: { select: { id: true } },
          },
        },
      },
    });

    if (!group) return res.status(404).json({ message: "group not found" });

    return res.json(group);
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

app.post("/upload", authMiddleware, async (req, res) => {
  try {
    console.log("RECEIVED UPLOAD REQUEST");

    const { groupId, caption, location, front, back } = req.body as {
      groupId: string;
      caption: string;
      location: { latitude: number; longitude: number };
      front: { raw: string; name: string; type: string };
      back: { raw: string; name: string; type: string };
    };

    if (!groupId || !caption || !location || !front || !back) {
      return res.status(400).json({
        message: "groupId, caption, location, front and back are required",
      });
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: front.name,
        Body: Buffer.from(front.raw, "base64"),
        ContentType: front.type,
      }),
    );

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: back.name,
        Body: Buffer.from(back.raw, "base64"),
        ContentType: back.type,
      }),
    );

    const frontUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: front.name,
      }),
      { expiresIn: 60 * 60 * 24 * 7 },
    );

    const backUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: back.name,
      }),
      { expiresIn: 60 * 60 * 24 * 7 },
    );

    const locationInDb = await prisma.location.findFirst({
      where: { latitude: location.latitude, longitude: location.longitude },
    });

    await prisma.post.create({
      data: {
        caption,
        author: { connect: { id: req.user.id } },
        group: { connect: { id: groupId } },
        location: locationInDb?.id
          ? { connect: { id: locationInDb.id } }
          : { create: location },
        frontImage: frontUrl,
        backImage: backUrl,
      },
    });

    return res.status(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unexpected server error" });
  }
});

app.listen(port, () => {
  return console.log(
    `Express server is listening at http://localhost:${port} 🚀`,
  );
});
