import "dotenv-safe/config";
import express from "express";
import cors from "cors";
import { facilityService } from "./services/facilityService";
import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import aiRouter from "./routes/ai.router";
import ifcRouter from "./routes/ifc.router";
import db from "./config/db";

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "../drizzle"),
  });

  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/api/ai", aiRouter);
  app.use("/api/ifc", ifcRouter);

  app.post("/api/facilities/create", async (req, res) => {
    const facility = await facilityService.createFacility();

    res.json(facility);
  });

  app.get("/api/facilities/:id", async (req, res) => {
    const { id } = req.params;
    const facility = await facilityService.getFacility(id);

    res.json(facility);
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main();
