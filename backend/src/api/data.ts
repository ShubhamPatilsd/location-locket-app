import express, { Response } from "express";
import prisma from "../../db";
const router = express.Router();

/**
 * Handle all PUT events sent to the server by the client PowerSync application
 */
router.put("/", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Invalid body provided" });
    return;
  }
  await upsert(req.body, res);
});

/**
 * Handle all PATCH events sent to the server by the client PowerSync application
 */
router.patch("/", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Invalid body provided" });
    return;
  }
  await upsert(req.body, res);
});

/**
 * Handle all DELETE events sent to the server by the client PowerSync application
 */
router.delete("/", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Invalid body provided" });
    return;
  }

  // The table which needs to be updated
  const table = req.body.table;
  // The data of the object
  const data = req.body.data;

  console.log(table, data);

  await prisma.$queryRaw`DELETE FROM ${table} WHERE id = ${data.id}`;
  res.status(200).send({ message: `DELETE completed for ${table} ${data.id}` });
});

/**
 * Upsert a row in a table based on the data sent from the PowerSync client
 * @param body
 * @param res
 * @returns {Promise<void>}
 */
// TODO: Define types
const upsert = async (body: { table: string; data: any }, res: Response) => {
  try {
    const table = body.table;
    const row = body.data;
    console.log(row);
    let text = null;
    let values: any[] = [];
    switch (table) {
      case "users":
        text =
          "INSERT INTO users(id, firstName, lastName, email, profilePicture, lastKnownLocation, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET firstName = EXCLUDED.firstName, lastName = EXCLUDED.lastName, email = EXCLUDED.email, profilePicture = EXCLUDED.profilePicture, lastKnownLocation = EXCLUDED.lastKnownLocation, updatedAt = EXCLUDED.updatedAt";
        values = [
          row.id,
          row.firstName,
          row.lastName,
          row.email,
          row.profilePicture,
          row.lastKnownLocation,
          row.createdAt,
          row.updatedAt,
        ];
        break;
      case "groups":
        text =
          "INSERT INTO todos(id, name, code, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, updatedAt = EXCLUDED.updatedAt, createdAt = EXCLUDED.createdAt";
        values = [row.id, row.name, row.code, row.createdAt, row.updatedAt];
        break;
      case "group_to_user":
        text =
          "INSERT INTO group_to_user(group_id, user_id) VALUES ($1, $2) ON CONFLICT (group_id, user_id) DO NOTHING";
        values = [row.group_id, row.user_id];
        break;
      case "posts":
        text =
          "INSERT INTO posts(id, frontImage, backImage, caption, location, authorId, groupId, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET frontImage = EXCLUDED.frontImage, backImage = EXCLUDED.backImage, caption = EXCLUDED.caption, location = EXCLUDED.location, authorId = EXCLUDED.authorId, groupId = EXCLUDED.groupId, updatedAt = EXCLUDED.updatedAt, createdAt = EXCLUDED.createdAt";
        values = [
          row.id,
          row.frontImage,
          row.backImage,
          row.caption,
          row.location,
          row.authorId,
          row.groupId,
          row.createdAt,
          row.updatedAt,
        ];
        break;
      default:
        break;
    }
    if (text && values.length > 0) {
      await prisma.$executeRawUnsafe(text, ...values);
      res.status(200).send({ message: `PUT completed for ${table} ${row.id}` });
    } else {
      res.status(400).send({ message: "Invalid body provided, expected table and data" });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};

export { router as dataRouter };
