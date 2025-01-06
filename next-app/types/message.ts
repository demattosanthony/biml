export enum MessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

export type ChatMessage = {
  role: MessageRole;
  content: string | null;
  id?: string;
  toolCalls?: ToolCall[];
};

export type ExecutePythonCodeResilt = {
  output: string;
};

type FunctionResultMap = {
  execute_python_code_against_model: ExecutePythonCodeResilt;
};

export type ToolCall = {
  [K in keyof FunctionResultMap]: {
    id: string;
    type: "function";
    function: { name: K; arguments: string };
    status: "pending" | "completed" | "failed";
    result?: string;
    error?: boolean;
  };
}[keyof FunctionResultMap];
