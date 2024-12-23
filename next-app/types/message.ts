// Enum to define the roles in the chat
export enum MessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

// Type definition for a chat message
export type ChatMessage = {
  role: MessageRole;
  content: string | null;
  id?: string;
  ifcFileContent?: string;
  isStreamingIfc?: boolean;
};

export type TestToolResult = Array<{
  content: string;
  metadata: Record<string, any>;
  id: number;
}>;

type FunctionResultMap = {
  testTool: TestToolResult;
};

export type ToolCall = {
  [K in keyof FunctionResultMap]: {
    id: string;
    type: "function";
    function: { name: K; arguments: string };
    status: "pending" | "completed" | "failed";
    result?: FunctionResultMap[K];
  };
}[keyof FunctionResultMap];
