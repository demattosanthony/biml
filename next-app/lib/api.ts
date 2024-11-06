import { fetchEventSource } from "@microsoft/fetch-event-source";
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async generateText(
    messages: {
      role: string;
      content: string;
    }[]
  ): Promise<
    (
      onMessage: (message: string) => void,
      onDone: () => void
    ) => Promise<() => void>
  > {
    const url = `${this.baseUrl}/api/inference`;

    console.log("Running thread");
    console.log(url);
    console.log(messages);

    return async (onMessage: (message: string) => void, onDone: () => void) => {
      const controller = new AbortController();

      const abortFunction = () => {
        controller.abort();
      };

      try {
        await fetchEventSource(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
          signal: controller.signal,
          onmessage: (event) => {
            if (event.event === "message") {
              const parsedData = JSON.parse(event.data);
              const { chunk } = parsedData;
              onMessage(chunk);
            }

            if (event.event === "DONE") {
              controller.abort();
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

      return abortFunction;
    };
  }
}

const api = new ApiClient("http://localhost:3000");

export default api;
