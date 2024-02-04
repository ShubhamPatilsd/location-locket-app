import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn", "info"],
  errorFormat: "pretty",
});

export default prisma;
