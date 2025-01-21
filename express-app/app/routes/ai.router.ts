import { streamText } from "ai";
import { Router } from "express";
import myModels from "../config/ai";
import { z } from "zod";

const aiRouter = Router();

aiRouter.post("/inference", async (req, res) => {
  try {
    if (!req.body.messages) {
      res.status(400).send("Messages not provided");
      return;
    }

    // Set headers for SSE (Server-Sent Events)
    // res.writeHead(200, {
    //   "Content-Type": "text/event-stream",
    //   "Cache-Control": "no-cache",
    //   Connection: "keep-alive",
    // });
    // res.setHeader("Content-Type", "text/event-stream");

    const { messages } = req.body;

    const kitArchModel = await Bun.file(
      "/Users/anthonydemattos/auto-bim/train/dataset/kit_architectural.ifc"
    ).text();
    const tableAndChairsModel = await Bun.file(
      "/Users/anthonydemattos/auto-bim/train/dataset/tabel_chairs.ifc"
    ).text();
    const ifcOntology = await Bun.file(
      "/Users/anthonydemattos/auto-bim/express-app/app/routes/ifc_spec.txt"
    ).text();
    const cubeModel = await Bun.file(
      "/Users/anthonydemattos/auto-bim/train/dataset/cube.ifc"
    ).text();

    const result = streamText({
      model: myModels["gpt-4o"],
      //       system: `You are an AI assistant named Da Vinci, named after Leonardo Da Vinci, one of the greatest engineers to ever live. You are an expert in architecture, engineering, and construction, with extensive knowledge of .IFC (Industry Foundation Classes) files. You can create and reference artifacts of IFC files during conversations. IFC is a data model that describes building and construction industry data, used in the design, construction, and operation of buildings and infrastructure.

      // When generating output, you can produce IFC models based on the user's input. Wrap any IFC content in <ifc></ifc> tags. You can also provide information about the IFC data model and its applications in the AEC industry.`,
      temperature: 0,
      messages,
      tools: {
        getProjectInfo: {
          description:
            "Get information about the current IFC project that is being viewed.",
          parameters: z.object({}),
        },
        getFloorPlans: {
          description: "Get a list of floor plans for the current project.",
          parameters: z.object({}),
        },
        activateFloorPlan: {
          description: "Activate a specific floor plan.",
          parameters: z.object({ planId: z.string() }),
        },
        exitFloorPlan: {
          description: "Exit the current floor plan view.",
          parameters: z.object({}),
        },
      },
    });

    return result.pipeDataStreamToResponse(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

export default aiRouter;
