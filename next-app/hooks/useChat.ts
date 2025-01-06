import api from "@/lib/api";
import { ChatMessage, MessageRole } from "@/types/message";
import { EventSourceMessage } from "@microsoft/fetch-event-source";
import { atom, useAtom } from "jotai";

export const messagesAtom = atom<ChatMessage[]>([
  //   {
  //     role: MessageRole.user,
  //     content: "What are you",
  //   },
  //   {
  //     role: MessageRole.assistant,
  //     content: `Arguments: "{}"
  // Tool Result: {
  //   "guid": "0w984V0GL6yR4z75XVLWOq",
  //   "type": "IfcProject",
  //   "name": "0001"
  // }
  // Arguments: "{\"guid\": \"0w984V0GL6yR4z75XVLWOq\"}"
  // Tool Result: [
  //   {
  //     "guid": "0w984V0GL6yR4z75XVLWOs",
  //     "type": "IfcSite",
  //     "name": "Default"
  //   }
  // ]
  // I'll first get some additional details about the project to help inspire the story.
  // Let me explore the model a bit to get more context:
  // Here's a short story inspired by this IFC model:
  // The Architect's Blueprint
  // In the quiet drafting room of Project 0001, Elena traced her fingers along the pristine lines of her latest design. The model number might seem mundane to others, but to her, it represented more than just a sequence—it was a promise of possibility.
  // The default site lay before her, a blank canvas waiting to be transformed. Each geometric precision in her IFC model was a whisper of potential: walls yet unbuilt, spaces waiting to be filled with life, dreams waiting to take structural form.
  // "Every great building starts with a single coordinate," she murmured to herself, adjusting a digital wall with the delicate touch of an artist. Project 0001 wasn't just a project number—it was the first step in her vision of creating spaces that would breathe, that would tell stories long after the blueprints were filed away.
  // Outside her window, the real world waited. But here, in the realm of her digital model, anything was possible. One line, one element at a time, she was about to bring an entire world into existence.
  // The story captures the essence of an architectural project in its early stages, reflecting the potential and creativity inherent in an IFC model, symbolized by the project's simple name "0001" and its default site. It highlights the architect's perspective and the transformative power of design.`,
  //   },
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
    if (!ifcSessionId) return;
    const _threadId = await api.createThread(ifcSessionId);
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
            const { id, result, error } = parsedData;

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
                      error: error ? error : undefined,
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
