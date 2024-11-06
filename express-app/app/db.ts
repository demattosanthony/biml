import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";
import { __prod__ } from "./constants";

// export type DbUser = typeof usersTable.$inferSelect;

const pgClient = new Client({
  connectionString: __prod__
    ? process.env.DATABASE_URL!
    : "postgresql://postgres:postgres@localhost:5432/postgres",
});

await pgClient.connect();

const db = drizzle(pgClient, { schema });

export default db;
