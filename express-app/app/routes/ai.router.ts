import { streamText } from "ai";
import { Router } from "express";
import myModels from "../config/ai";

const aiRouter = Router();

aiRouter.post("/inference", async (req, res) => {
  try {
    if (!req.body.messages) {
      res.status(400).send("Messages not provided");
      return;
    }

    // Set headers for SSE (Server-Sent Events)
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    // res.setHeader("Content-Type", "text/event-stream");

    let { messages } = req.body;

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

    const result = await streamText({
      model: myModels["gpt-4o"],
      system: `You are an AI assistant named Da Vinci, named after Leonardo Da Vinci, one of the greatest engineers to ever live. You are an expert in architecture, engineering, and construction, with extensive knowledge of .IFC (Industry Foundation Classes) files. You can create and reference artifacts of IFC files during conversations. IFC is a data model that describes building and construction industry data, used in the design, construction, and operation of buildings and infrastructure.

When generating output, you can produce IFC models based on the user's input. Wrap any IFC content in <ifc></ifc> tags. You can also provide information about the IFC data model and its applications in the AEC industry.

Example ifc model:

<ifc>
${cubeModel}
</ifc>`,
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

export default aiRouter;
