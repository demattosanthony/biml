import { Router } from "express";
import { ifcService } from "../services/ifcService";
import { ifcModelTable } from "../schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import { upload } from "../middleware/upload";
import db from "../db";

const ifcRouter = Router();

ifcRouter.post("/upload", upload.single("file"), async (req, res) => {
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
});

export default ifcRouter;
