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

    const result = await streamText({
      model: myModels["gpt-4o-mini"],
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

export default aiRouter;
