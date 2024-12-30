import api from "@/lib/api";
import { ChatMessage, MessageRole } from "@/types/message";
import { EventSourceMessage } from "@microsoft/fetch-event-source";
import { atom, useAtom } from "jotai";

export const messagesAtom = atom<ChatMessage[]>([
  // {
  //   role: MessageRole.user,
  //   content: "What are you",
  // },
  // {
  //   role: MessageRole.assistant,
  //   content: "Hello! How are you doing today?",
  // },
]);
const inputAtom = atom("");
const generatingAtom = atom(false);
const abortControllerAtom = atom<AbortController>(new AbortController());
const bufferAtom = atom("");
const selectedIfcFileAtom = atom<{
  index: number;
  content: string;
} | null>(null);
const artifactModeAtom = atom<"preview" | "file">("file");
const threadIdAtom = atom<string | null>(null);
const ifcSessionIdAtom = atom<string | null>(null);

export function useChat() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [generating, setGenerating] = useAtom(generatingAtom);
  const [abortController, setAbortController] = useAtom(abortControllerAtom);
  const [buffer, setBuffer] = useAtom(bufferAtom);
  const [artifactMode, setArtifactMode] = useAtom(artifactModeAtom);
  const [input, setInput] = useAtom(inputAtom);
  const [threadId, setThreadId] = useAtom(threadIdAtom);
  const [ifcSessionId, setIfcSessionId] = useAtom(ifcSessionIdAtom);

  const [selectedIfcFile, setSelectedIfcFile] = useAtom(selectedIfcFileAtom);

  const addMessage = (newMessage: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const createThread = async () => {
    const _threadId = await api.createThread(ifcSessionId || "");
    setThreadId(_threadId);
    console.log("Thread created:", _threadId);
  };

  const handleAbort = () => {
    if (abortController) {
      console.log("Aborting generation...");
      abortController.abort();
      setGenerating(false);
      setAbortController(new AbortController());
      setBuffer("");
    }
  };

  const updateLatestAssistantMessage = (updatedContent: string) => {
    setMessages((prevMessages) => {
      let updatedMessages = [...prevMessages];
      let lastMessage = updatedMessages[updatedMessages.length - 1];
      lastMessage.content += updatedContent;

      return updatedMessages;
    });
  };

  const handleMessagesDone = () => {
    if (buffer) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = {
          ...updatedMessages[updatedMessages.length - 1],
        };
        lastMessage.content = (lastMessage.content || "") + buffer;
        updatedMessages[updatedMessages.length - 1] = lastMessage;
        return updatedMessages;
      });
      setBuffer("");
    }

    setGenerating(false);
  };

  const sendMessage = async () => {
    if (!input || !threadId || !ifcSessionId) return;

    setGenerating(true);
    setBuffer("");

    // 1) Add user's message
    addMessage({
      role: MessageRole.user,
      content: input,
    });

    // 2) Create an empty assistant message to be filled with streamed text
    addMessage({
      role: MessageRole.assistant,
      content: "",
      toolCalls: [],
    });

    try {
      const gen = await api.chat(input, threadId);
      setInput("");

      await gen(
        (event: EventSourceMessage) => {
          const { event: eventType, data } = event;

          if (eventType === "message") {
            // 3) Normal LLM text streaming
            const { chunk } = JSON.parse(data);
            updateLatestAssistantMessage(chunk);
          } else if (eventType === "tool_selected") {
            // 4) LLM decides to call a tool
            const parsedData = JSON.parse(data);
            const { id, name, arguments: args } = parsedData;

            // Insert a new ToolCall into the last assistant message
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (
                lastIdx >= 0 &&
                updated[lastIdx].role === MessageRole.assistant
              ) {
                const lastAssistant = updated[lastIdx];
                // Initialize if not defined
                if (!lastAssistant.toolCalls) {
                  lastAssistant.toolCalls = [];
                }
                lastAssistant.toolCalls.push({
                  id,
                  type: "function",
                  function: { name, arguments: args },
                  status: "pending",
                });
              }
              return updated;
            });
          } else if (eventType === "tool_result") {
            // 5) Tool execution completed
            const parsedData = JSON.parse(data);
            const { id, result } = parsedData;

            // Find the matching tool call in the last assistant message and update it
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (
                lastIdx >= 0 &&
                updated[lastIdx].role === MessageRole.assistant
              ) {
                const lastAssistant = updated[lastIdx];
                if (lastAssistant.toolCalls) {
                  const toolCallIndex = lastAssistant.toolCalls.findIndex(
                    (call) => call.id === id
                  );
                  if (toolCallIndex !== -1) {
                    lastAssistant.toolCalls[toolCallIndex] = {
                      ...lastAssistant.toolCalls[toolCallIndex],
                      status: "completed",
                      result,
                    };
                  }
                }
              }
              return updated;
            });
          } else if (eventType === "DONE") {
            handleMessagesDone();
          }
        },
        handleMessagesDone,
        abortController.signal
      );
    } catch (error) {
      console.log("Generation aborted or failed", error);
    } finally {
      setGenerating(false);
      setBuffer("");
    }
  };

  const resetChat = async () => {
    setMessages([]);
    setBuffer("");
    setInput("");
    if (ifcSessionId) {
      const _threadId = await api.createThread(ifcSessionId);
      setThreadId(_threadId);
    }
  };

  return {
    input,
    setInput,
    ifcSessionId,
    messages,
    handleAbort,
    generating,
    addMessage,
    setSelectedIfcFile,
    selectedIfcFile,
    updateLatestAssistantMessage,
    resetChat,
    sendMessage,
    artifactMode,
    setArtifactMode,
    setIfcSessionId,
    createThread,
  };
}
