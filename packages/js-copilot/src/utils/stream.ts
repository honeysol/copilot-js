import { StreamState } from "../";

const asTextStream = async (
  response: Response,
  callback: (text: string) => void
) => {
  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }
  const decoder = new TextDecoder("utf-8");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const { done, value } = await reader.read();
      if (done === true) {
        break;
      }
      const textChunk = decoder.decode(value, { stream: true });
      callback(textChunk);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        return;
      } else {
        throw e;
      }
    }
  }
};


export const fetchStream = (
  url: URL | RequestInfo,
  data: unknown,
  callback: (output: string) => void,
  headers: HeadersInit = {}
): StreamState => {
  let aborted = false;
  const controller = new AbortController();
  const promise = (async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(data),
    });
    await asTextStream(response, (text) => {
      if (!aborted) {
        callback(text);
      }
    });
  })();
  const streamState = {
    abort: () => {
      aborted = true;
      controller.abort();
    },
    promise,
    finished: false,
  };
  (async () => {
    await promise;
    streamState.finished = true;
  })();
  return streamState;
};
