import api from "@/lib/api";
import { atom, useAtom } from "jotai";

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

export const messagesAtom = atom<ChatMessage[]>([]);
const generatingAtom = atom(false);
const abortControllerAtom = atom<AbortController>(new AbortController());
const bufferAtom = atom("");

export function useChat() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [generating, setGenerating] = useAtom(generatingAtom);
  const [abortController, setAbortController] = useAtom(abortControllerAtom);
  const [buffer, setBuffer] = useAtom(bufferAtom);

  const addMessage = (newMessage: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
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
    setBuffer((prevBuffer) => {
      const newBuffer = prevBuffer + updatedContent;

      // Handle streaming IFC content
      if (newBuffer.includes("<ifc>")) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = {
            ...updatedMessages[updatedMessages.length - 1],
          };

          const ifcStartIndex = newBuffer.indexOf("<ifc>");
          const ifcEndIndex = newBuffer.includes("</ifc>")
            ? newBuffer.indexOf("</ifc>")
            : newBuffer.length;

          // If we're not already streaming IFC, preserve existing content and start streaming
          if (!lastMessage.isStreamingIfc) {
            lastMessage.isStreamingIfc = true;
            // Keep any existing content and add content before the IFC tag
            const existingContent = lastMessage.content || "";
            const contentBeforeIfc = newBuffer.slice(0, ifcStartIndex);
            lastMessage.content = existingContent + contentBeforeIfc;
            lastMessage.ifcFileContent = "";
          }

          // Extract and update IFC content - only up to the closing tag if it exists
          const ifcContent = newBuffer.slice(
            ifcStartIndex + "<ifc>".length,
            ifcEndIndex
          );
          lastMessage.ifcFileContent = ifcContent;

          // If we have the closing tag, finalize the IFC block
          if (newBuffer.includes("</ifc>")) {
            lastMessage.isStreamingIfc = false;
            const afterIfcIndex = newBuffer.indexOf("</ifc>") + "</ifc>".length;
            const remainingContent = newBuffer.slice(afterIfcIndex);
            if (remainingContent) {
              lastMessage.content = lastMessage.content + remainingContent;
            }
          }

          updatedMessages[updatedMessages.length - 1] = lastMessage;
          return updatedMessages;
        });

        // Keep buffering if we're still in IFC block
        if (!newBuffer.includes("</ifc>")) {
          return newBuffer;
        }
        // Clear buffer after IFC block is complete
        return newBuffer.slice(newBuffer.indexOf("</ifc>") + "</ifc>".length);
      }

      // Handle non-IFC content normally
      if (!newBuffer.includes("<ifc>")) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = {
            ...updatedMessages[updatedMessages.length - 1],
          };
          lastMessage.content = (lastMessage.content || "") + updatedContent;
          updatedMessages[updatedMessages.length - 1] = lastMessage;
          return updatedMessages;
        });
        return "";
      }

      return newBuffer;
    });
  };

  const generateText = async (messagesToSend: ChatMessage[]) => {
    setGenerating(true);
    setBuffer("");

    const messageHandler = (message: string) => {
      updateLatestAssistantMessage(message);
    };

    try {
      const gen = await api.generateText(messagesToSend);
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

  const resetChat = () => {
    setMessages([]);
    setBuffer("");
  };

  return {
    messages,
    handleAbort,
    generating,
    addMessage,
    updateLatestAssistantMessage,
    resetChat,
    generateText,
  };
}
