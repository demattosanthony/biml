import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { facilityTable, ifcModelTable } from "./schema";
import { __prod__ } from "./constants";

// export type DbUser = typeof usersTable.$inferSelect;

const queryClient = postgres(
  __prod__
    ? process.env.DATABASE_URL!
    : "postgresql://postgres:postgres@localhost:5432/postgres"
);

export const db = drizzle(queryClient, {
  schema: {
    facilities: facilityTable,
    ifc_model: ifcModelTable,
  },
});
