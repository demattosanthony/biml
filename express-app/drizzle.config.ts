import { defineConfig } from "drizzle-kit";
import { __prod__ } from "./app/constants";

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/config/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: __prod__
      ? process.env.DATABASE_URL!
      : "postgresql://postgres:postgres@localhost:5432/postgres",
  },
});
