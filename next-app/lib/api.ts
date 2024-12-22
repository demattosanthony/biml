import { ChatMessage } from "@/hooks/useChat";
import { fetchEventSource } from "@microsoft/fetch-event-source";
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async chat(
    message: string
  ): Promise<
    (
      onMessage: (message: string) => void,
      onDone: () => void,
      signal: AbortSignal
    ) => Promise<void>
  > {
    const url = `${this.baseUrl}/chat`;

    console.log("Running thread");
    console.log(url);
    console.log(message);

    return async (
      onMessage: (message: string) => void,
      onDone: () => void,
      signal: AbortSignal
    ) => {
      try {
        await fetchEventSource(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
          }),
          signal,
          onmessage: (event) => {
            if (event.event === "message") {
              const parsedData = JSON.parse(event.data);
              const { chunk } = parsedData;
              onMessage(chunk);
            }

            if (event.event === "DONE") {
              onDone();
            }
          },
          onclose: () => {
            // Handle close event if needed
          },
          onerror: (err) => {
            console.error(`Error running thread: ${err}`);
            throw err; // Propagate the error
          },
        });
      } catch (error) {
        console.error("Error in runThread:", error);
        throw error;
      }
    };
  }
}

const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);

export default api;
