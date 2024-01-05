import { StreamState } from "..";

/**
 * Custom error class for fetch response errors.
 */
export class FetchResponseError extends Error {
  response: Response;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(response: Response, data: any, cause?: Error) {
    super(undefined, cause ? { cause } : undefined);
    this.response = response;
    this.data = data;
  }
}

new Error(undefined, { cause: new Error() });

/**
 * Creates an observable stream from a fetch response that contains text stream.
 * @param {function} callback A function to be called for each text chunk.
 * @param {object} controller An AbortController instance that can be used to abort the request.
 * @param {object} responsePromise A promise that resolves to a fetch response that contains text stream.
 * @returns {StreamState} An observable stream of SSE data events.
 */
export const fromFetchTextStream = ({
  callback,
  controller,
  responsePromise,
}: {
  callback: (output: string) => void;
  controller: AbortController;
  responsePromise: Promise<Response>;
}): StreamState => {
  let aborted = false;
  const streamState = {
    abort: () => {
      aborted = true;
      controller.abort();
    },
    promise: (async () => {
      try {
        const response = await responsePromise;
        if (!response.ok) {
          throw await (async () => {
            try {
              const isJson = response.headers
                .get("Content-Type")
                ?.includes("application/json");
              if (isJson) {
                return new FetchResponseError(response, await response.json());
              } else {
                return new FetchResponseError(response, await response.text());
              }
            } catch (e) {
              return new FetchResponseError(response, undefined, e as Error);
            }
          })();
        }
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder("utf-8");
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done === true || aborted) {
            break;
          }
          const textChunk = decoder.decode(value, { stream: true });
          callback(textChunk);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          // Ignore abort errors.
          return;
        } else {
          throw e;
        }
      }
    })(),
  };
  return streamState;
};
