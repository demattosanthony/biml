import api from "@/lib/api";
import { atom, useAtom } from "jotai";

// Enum to define the roles in the chat
export enum MessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

// Type definition for a function call
// export type FunctionCall = {
//   name: string;
//   arguments: string;
//   executing: boolean;
// };

// Type definition for a chat message
export type ChatMessage = {
  role: MessageRole;
  content: string | null;
  // function_call?: FunctionCall;
  id?: string;
  // performedWebSearch?: boolean;
  // sources?: {
  //   content: string;
  //   metadata: {
  //     document_url: string;
  //     page_number: number;
  //     filename: string;
  //   };
  // }[];
};

export const messagesAtom = atom<ChatMessage[]>([
  // {
  //   role: MessageRole.user,
  //   content: "Hello",
  // },
  // {
  //   role: MessageRole.assistant,
  //   content: "Hello, how can I help you?",
  // },
]);
const generatingAtom = atom(false);

export function useChat() {
  const [messages, setMessages] = useAtom(messagesAtom);

  const [generating, setGenerating] = useAtom(generatingAtom);

  // useEffect(() => {
  //   if (
  //     messages.length === 0
  //   ) {
  //     setMessages(initialMessages.reverse());
  //   }
  // }, [threadId, initialMessages, messages.length, setMessages]);

  const initializeChat = async () => {
    // const thread = await apiClient.createAIThread();
    // setThreadId(thread.id as string);
  };

  const addMessage = (newMessage: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const updateLatestAssistantMessage = (updatedContent: string) => {
    setMessages((prevMessages) => {
      let updatedMessages = [...prevMessages];
      let lastMessage = updatedMessages[updatedMessages.length - 1];
      lastMessage.content += updatedContent;

      return updatedMessages;
    });
  };

  const generateText = async (messagesToSend: ChatMessage[]) => {
    setGenerating(true);

    const messageHandler = (message: string) => {
      console.log(message);
      updateLatestAssistantMessage(message);
    };
    const gen = await api.generateText(messagesToSend as any);
    gen(messageHandler, () => {
      setGenerating(false);
    });
  };

  const resetChat = () => {
    setMessages([]);
  };

  return {
    messages,
    setGenerating,
    generating,
    setMessages,
    initializeChat,
    addMessage,
    updateLatestAssistantMessage,
    resetChat,
    generateText,
  };
}
