import { eq } from "drizzle-orm";
import { facilityTable, ifcModelTable } from "../schema";
import db from "../config/db";

export const facilityService = {
  createFacility: async () => {
    const [facility] = await db.insert(facilityTable).values({}).returning();

    return facility;
  },

  getFacility: async (id: string) => {
    const data = await db
      .select()
      .from(facilityTable)
      .leftJoin(ifcModelTable, eq(facilityTable.id, ifcModelTable.facilityId))
      .where(eq(facilityTable.id, id))
      .limit(1)
      .execute();

    if (data.length === 0) return null;

    const facility = {
      id: data[0].facility.id,
      ifcModels: data.map((row) => ({
        id: row.ifc_model?.id,
        name: row.ifc_model?.name,
        description: row.ifc_model?.description,
        modelFragmentUrl: row.ifc_model?.modelFragmentUrl,
      })),
    };

    return facility;
  },
};
