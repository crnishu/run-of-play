import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

// datasource.url here targets CLI operations (db push / migrate).
// Falls back to DATABASE_URL so prisma generate (install-time, no DB needed) never throws.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
