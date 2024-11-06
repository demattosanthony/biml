import "dotenv-safe/config";
import express, { Express, Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs/promises";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";
import path from "path";
import { facilityService } from "./services/facilityService";
import { ifcService } from "./services/ifcService";
import { ifcModelTable } from "./schema";
import { eq } from "drizzle-orm";
import { streamText } from "ai";
import myModels from "./config/ai";

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "../drizzle"),
  });

  const app: Express = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  const upload = multer({ dest: "uploads/" });

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
  });

  app.post("/api/facilities/create", async (req: Request, res: Response) => {
    const facility = await facilityService.createFacility();

    res.json(facility);
  });

  app.get("/api/facilities/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const facility = await facilityService.getFacility(id);

    res.json(facility);
  });

  app.post(
    "/api/ifc/upload",
    upload.single("file"),
    async (req: Request, res: Response) => {
      const { facilityId } = req.body;

      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const filePath = req.file.path;
      const fileName = req.file.originalname;

      const ifcModel = await ifcService.createIfcModel(facilityId, fileName);

      const fragmentUrl = await ifcService.convertIfcToFragments(
        filePath,
        facilityId,
        ifcModel.id
      );

      console.log(fragmentUrl);

      await db
        .update(ifcModelTable)
        .set({ modelFragmentUrl: fragmentUrl })
        .where(eq(ifcModelTable.id, ifcModel.id))
        .execute();

      console.log("Updated");

      // const geometry = await ifcService.extractGeomtryTilesFromIFC(
      //   facilityId,
      //   ifcModel.id,
      //   filePath
      // );

      res.send({
        message: "IFC file uploaded successfully",
        ifcModel,
      });

      // Delete the uploaded file
      fs.unlink(req.file.path).catch((err) => console.error(err));
    }
  );

  app.post("/api/inference", async (req: Request, res: Response) => {
    try {
      // Set headers for SSE
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      if (!req.body.messages) {
        res.status(400).send("Messages not provided");
        return;
      }
      let { messages } = req.body;
      console.log(messages);

      const result = await streamText({
        model: myModels["gpt-4o"],
        system: "You are a design engineer",
        temperature: 0,
        messages,
      });

      for await (const textPart of result.textStream) {
        res.write(
          `event: message\ndata: ${JSON.stringify({ chunk: textPart })}\n\n`
        );
      }

      res.write("event: DONE\ndata: \n\n");
      res.end();
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main();
