import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

// Charger .env depuis le dossier courant
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "bun run prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
