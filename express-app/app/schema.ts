import { sql } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

// export const usersTable = pgTable("users", {
//   id: uuid("id")
//     .primaryKey()
//     .default(sql`uuid_generate_v4()`)
//     .notNull(),
//   discordId: text("discord_id").notNull(),
//   refreshTokenVersion: integer("refresh_token_version").default(1).notNull(),
// });

export const facilityTable = pgTable("facility", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
});

export const ifcModelTable = pgTable("ifc_model", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  name: text("name").notNull(),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilityTable.id),
  modelFragmentUrl: text("model_fragment_url"),
  description: text("description"),
});
