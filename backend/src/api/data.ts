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
// TODO: Define types and the upsert function
const upsert = async (body: { table: string; data: any }, res: Response) => {
  // try {
  //   const table = body.table;
  //   const row = body.data;
  //   console.log(row);
  //   let text = null;
  //   let values: any[] = [];
  //   switch (table) {
  //     case "lists":
  //       text =
  //         "INSERT INTO lists(id, created_at, name, owner_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET created_at = EXCLUDED.created_at, name = EXCLUDED.name, owner_id = EXCLUDED.owner_id";
  //       values = [row.id, row.created_at, row.name, row.owner_id];
  //       break;
  //     case "todos":
  //       text =
  //         "INSERT INTO todos(id, completed_at, description, completed, created_by, completed_by, list_id) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET completed_at = EXCLUDED.completed_at, completed = EXCLUDED.completed, completed_by = EXCLUDED.completed_by";
  //       values = [
  //         row.id,
  //         row.completed_at,
  //         row.description,
  //         row.completed,
  //         row.created_by,
  //         row.completed_by,
  //         row.list_id,
  //       ];
  //       break;
  //     default:
  //       break;
  //   }
  //   if (text && values.length > 0) {
  //     const client = await pool.connect();
  //     await client.query(text, values);
  //     await client.release();
  //     res.status(200).send({ message: `PUT completed for ${table} ${row.id}` });
  //   } else {
  //     res.status(400).send({ message: "Invalid body provided, expected table and data" });
  //   }
  // } catch (err: any) {
  //   console.error(err);
  //   res.status(500).send({ error: err.message });
  // }
};

export { router as dataRouter };
