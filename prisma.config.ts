import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

// DIRECT_URL is only required for CLI migrations (prisma db push / migrate).
// prisma generate runs at install time without a DB connection, so we only
// override the datasource when the variable is actually present.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  ...(process.env.DIRECT_URL ? { datasource: { url: process.env.DIRECT_URL } } : {}),
});
