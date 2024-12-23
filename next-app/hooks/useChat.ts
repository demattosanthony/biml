import api from "@/lib/api";
import { ChatMessage, MessageRole } from "@/types/message";
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
    if (threadId) return;
    const _threadId = await api.createThread();
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

  const sendMessage = async () => {
    console.log("Sending message...");
    console.log("Input:", input);
    console.log("ThreadId:", threadId);
    console.log("IfcSessionId:", ifcSessionId);
    if (!input || !threadId || !ifcSessionId) return;
    setGenerating(true);
    setBuffer("");

    const messageHandler = (message: string) => {
      updateLatestAssistantMessage(message);
    };

    // Add user input to the chat
    addMessage({
      role: MessageRole.user,
      content: input,
    });

    // Add empty message to the chat for the assistant to fill
    addMessage({
      role: MessageRole.assistant,
      content: "",
    });

    try {
      const gen = await api.chat(input, threadId, ifcSessionId);
      // Clear the input field
      setInput("");

      await gen(
        messageHandler,
        () => {
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
        },
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
    const _threadId = await api.createThread();
    setThreadId(_threadId);
  };

  return {
    input,
    setInput,
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
