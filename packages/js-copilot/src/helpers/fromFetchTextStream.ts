import { StreamState } from "..";

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
      const response = await responsePromise;
      if (response.status !== 200) {
        throw response;
      }
      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder("utf-8");
      try {
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
          return;
        } else {
          throw e;
        }
      }
    })(),
    finished: false,
  };
  (async () => {
    try {
      await streamState.promise;
      streamState.finished = true;
    } catch (e) {
      //
    }
  })();
  return streamState;
};
