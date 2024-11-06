import { openai } from "@ai-sdk/openai";

const myModels = {
  "gpt-4o-mini": openai("gpt-4o-mini"),
  "gpt-4o": openai("gpt-4o"),
};

export default myModels;
