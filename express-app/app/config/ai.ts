import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

const myModels = {
  "gpt-4o-mini": openai("gpt-4o-mini"),
  "gpt-4o": openai("gpt-4o"),
  "claude-3.5-sonnet": anthropic("claude-3-5-sonnet-20241022"),
  "gemini-1.5-pro": google("gemini-1.5-pro-002"),
};

export default myModels;
