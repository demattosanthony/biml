import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createThread(ifc_session_id: string): Promise<string> {
    const url = `${this.baseUrl}/threads/${ifc_session_id}`;

    const response = await fetch(url, {
      method: "POST",
    });

    const data = (await response.json()) as {
      thread_id: string;
    };

    return data.thread_id;
  }

  async getThread(threadId: string): Promise<{
    thread_id: string;
    created_at: string;
    session_id: string;
    messages: {
      role: string;
      content: string;
    }[];
  }> {
    const url = `${this.baseUrl}/threads/${threadId}`;

    const response = await fetch(url);

    const data = (await response.json()) as {
      thread_id: string;
      created_at: string;
      session_id: string;
      messages: {
        role: string;
        content: string;
      }[];
    };

    return data;
  }

  async createIfcSession(ifcFile: File): Promise<string> {
    const url = `${this.baseUrl}/ifc_sessions`;

    const formData = new FormData();
    formData.append("file", ifcFile);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      session_id: string;
    };

    return data.session_id;
  }

  async chat(
    message: string,
    threadId: string
  ): Promise<
    (
      onMessage: (message: EventSourceMessage) => void,
      onDone: () => void,
      signal: AbortSignal
    ) => Promise<void>
  > {
    const url = `${this.baseUrl}/chat`;

    return async (
      onMessage: (message: EventSourceMessage) => void,
      onDone: () => void,
      signal: AbortSignal
    ) => {
      try {
        await fetchEventSource(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message: message,
            thread_id: threadId,
          }),
          signal,
          onmessage: (event) => {
            onMessage(event);
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
