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

    let { messages } = req.body;

    const ifcOpenShellDocs = await Bun.file(
      "/Users/anthonydemattos/auto-bim/docs/ifcopenshell-docs.md"
    ).text();

    // const kitArchModel = await Bun.file(
    //   "/Users/anthonydemattos/auto-bim/train/dataset/kit_architectural.ifc"
    // ).text();
    // const tableAndChairsModel = await Bun.file(
    //   "/Users/anthonydemattos/auto-bim/train/dataset/tabel_chairs.ifc"
    // ).text();
    // const ifcOntology = await Bun.file(
    //   "/Users/anthonydemattos/auto-bim/express-app/app/routes/ifc_spec.txt"
    // ).text();
    const cubeModel = await Bun.file(
      "/Users/anthonydemattos/auto-bim/train/dataset/cube.ifc"
    ).text();

    const result = await streamText({
      model: myModels["gpt-4o"],
      system: `You are an AI assistant named Da Vinci, named after Leonardo Da Vinci, one of the greatest engineers to ever live. You are an expert in architecture, engineering, and construction, with extensive knowledge of .IFC (Industry Foundation Classes) files. You can create and reference artifacts of IFC files during conversations.
To generate ifc files you are able to write python code and use the ifcopenshell library. When generating the code use markdown formatting to return the code to the user like this:

\`\`\`python
import ifcopenshell
...
\`\`\`

Here is the entire ifcopenshell documentation for your reference:

${ifcOpenShellDocs}`,
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
