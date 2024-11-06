import * as OBC from "@thatopen/components";
import path from "path";
import fs from "fs/promises";
import supabase from "../config/supabase";
import { ifcModelTable } from "../schema";
import db from "../db";

export const ifcService = {
  createIfcModel: async (facilityId: string, name: string) => {
    const [ifcModel] = await db
      .insert(ifcModelTable)
      .values({
        facilityId,
        name,
      })
      .returning();

    return ifcModel;
  },

  convertIfcToFragments: async (
    filePath: string,
    facilityId: string,
    modelId: string
  ) => {
    try {
      const components = new OBC.Components();
      const fragments = components.get(OBC.FragmentsManager);
      const fragmentIfcLoader = components.get(OBC.IfcLoader);
      await fragmentIfcLoader.setup();

      const wasm = {
        path: path.join(__dirname, "../../node_modules/web-ifc/"),
        absolute: true,
      };

      fragmentIfcLoader.settings.wasm = wasm;

      const ifcArrayBuffer = new Uint8Array(await fs.readFile(filePath));

      const model = await fragmentIfcLoader.load(ifcArrayBuffer);

      if (!fragments.groups.size) {
        return;
      }
      const group = Array.from(fragments.groups.values())[0];
      const data = fragments.export(group);

      const file = new File([new Blob([data])], "small.frag");

      // Save file locally for testing
      const dirPath = path.join(__dirname, "../../geometry-files");
      await fs.mkdir(dirPath, { recursive: true });

      const fragPath = path.join(dirPath, "small.frag");
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      fs.writeFile(fragPath, fileBuffer)
        .then(() => {
          console.log("File saved successfully");
        })
        .catch((err) => {
          console.error(err);
        });

      const properties = group.getLocalProperties();

      if (properties) {
        const propertiesFile = new File(
          [JSON.stringify(properties)],
          "small.json"
        );

        // Save file locally for testing
        const propertiesPath = path.join(dirPath, "small.json");
        const propertiesBuffer = Buffer.from(
          await propertiesFile.arrayBuffer()
        );
        fs.writeFile(propertiesPath, propertiesBuffer)
          .then(() => {
            console.log("Properties saved successfully");
          })
          .catch((err) => {
            console.error(err);
          });
      }

      // const { data: uploadPropertiesData, error: propertiesError } =
      //   await supabase.storage
      //     .from("autobim")
      //     .upload(
      //       `${facilityId}/${modelId}/fragments/small.json`,
      //       propertiesFile
      //     );

      // if (propertiesError) {
      //   console.error(propertiesError);
      // }

      // Upload to supabase storage
      // const { data: uploadData, error } = await supabase.storage
      //   .from("autobim")
      //   .upload(`${facilityId}/${modelId}/fragments/small.frag`, file);

      // if (error) {
      //   console.error(error);
      // }

      // console.log("Uploaded Fragment");

      //   console.log("Uploaded Properties");
      // }

      return "";
    } catch (err) {
      console.error(err);
    }
  },

  extractGeomtryTilesFromIFC: async (
    facilityId: string,
    modelId: string,
    filePath: string
  ) => {
    const components = new OBC.Components();
    const fragments = new OBC.FragmentsManager(components);
    const tiler = components.get(OBC.IfcGeometryTiler);

    const wasm = {
      path: path.join(__dirname, "../../node_modules/web-ifc/"),
      absolute: true,
    };

    tiler.settings.wasm = wasm;
    tiler.settings.minGeometrySize = 20;
    tiler.settings.minAssetsSize = 1000;

    let files: { name: string; bits: (Uint8Array | string)[] }[] = [];
    let geometriesData: OBC.StreamedGeometries = {};
    let geometryFilesCount = 1;

    tiler.onGeometryStreamed.add((geometry) => {
      const { buffer, data } = geometry;
      const bufferFileName = `small.ifc-processed-geometries-${geometryFilesCount}`;
      for (const expressID in data) {
        const value = data[expressID];
        value.geometryFile = bufferFileName;
        geometriesData[expressID] = value;
      }
      files.push({ name: bufferFileName, bits: [buffer] });
      geometryFilesCount++;
    });

    let assetsData: OBC.StreamedAsset[] = [];

    tiler.onAssetStreamed.add((assets) => {
      assetsData = [...assetsData, ...assets];
    });

    tiler.onIfcLoaded.add((groupBuffer) => {
      files.push({
        name: "small.ifc-processed-global",
        bits: [groupBuffer],
      });
    });

    async function downloadFile(
      name: string,
      ...bits: (Uint8Array | string)[]
    ) {
      const file = new File(bits, name);

      // Upload to supabase storage
      const { data, error } = await supabase.storage
        .from("autobim")
        .upload(`${facilityId}/${modelId}/streaming/${name}`, file);
      console.log(data, error);

      // Ensure the directory exists
      // const dirPath = path.join(__dirname, "../../geometry-files");
      // await fs.mkdir(dirPath, { recursive: true });

      // // Save file
      // const filePath = path.join(dirPath, name);
      // const fileBuffer = Buffer.from(await file.arrayBuffer());
      // fs.writeFile(filePath, fileBuffer)
      //   .then(() => {
      //     console.log("File saved successfully");
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   });
    }

    async function downloadFilesSequentially(
      fileList: { name: string; bits: (Uint8Array | string)[] }[]
    ) {
      for (const { name, bits } of fileList) {
        downloadFile(name, ...bits);
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
    }

    tiler.onProgress.add((progress) => {
      if (progress !== 1) return;
      setTimeout(async () => {
        const processedData = {
          geometries: geometriesData,
          assets: assetsData,
          globalDataFileId: "small.ifc-processed-global",
        };
        files.push({
          name: "small.ifc-processed.json",
          bits: [JSON.stringify(processedData)],
        });
        await downloadFilesSequentially(files);
        assetsData = [];
        geometriesData = {};
        files = [];
        geometryFilesCount = 1;
      });
    });

    const ifcArrayBuffer = new Uint8Array(await fs.readFile(filePath));

    // This triggers the conversion, so the listeners start to be called
    await tiler.streamFromBuffer(ifcArrayBuffer);
  },
};
