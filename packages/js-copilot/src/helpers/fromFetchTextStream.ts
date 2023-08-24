import { StreamState } from "..";

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
