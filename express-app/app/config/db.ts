import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { __prod__ } from "../constants";

const db = drizzle(
  __prod__
    ? process.env.DATABASE_URL!
    : "postgresql://postgres:postgres@localhost:5432/postgres",
  {
    schema,
  }
);

export default db;
