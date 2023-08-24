import { StreamState } from "..";

type Stream<T> = AsyncIterable<T>;

export const fromOpenAIStream = <T>(
  streamPromise: Promise<Stream<T>>,
  callback: (chunk: T) => void,
): StreamState => {
  let aborted = false;
  const streamState = {
    abort: () => {
      aborted = true;
      (async () => {
        const stream = await streamPromise;
        // This specification is written in the document, but it is private in TypeScript.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stream as any).controller?.abort?.();
      })();
    },
    promise: (async () => {
      const stream = await streamPromise;
      for await (const chunk of stream) {
        if (aborted) break;
        callback(chunk);
      }
    })(),
    finished: false,
  };
  (async () => {
    await streamState.promise;
    streamState.finished = true;
  })();
  return streamState;
};
