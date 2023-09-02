import { StreamState } from "..";

/**
 * Creates an observable stream from a AsyncInterable object.
 * @param {function} callback A function to be called for each iteration.
 * @param {object} streamPromise A promise that resolves to AsyncInterable.
 * @returns {StreamState} An observable stream.
 */
export const fromAsyncIterable = <
  T,
  S extends AsyncIterable<T> = AsyncIterable<T>,
>(
  streamPromise: Promise<S>,
  callback: (chunk: T) => void,
  abortHandler?: (stream: S) => void,
): StreamState => {
  let aborted = false;
  const streamState = {
    abort: () => {
      aborted = true;
      (async () => {
        const stream = await streamPromise;
        abortHandler?.(stream);
      })();
    },
    promise: (async () => {
      const stream = await streamPromise;
      if (aborted) return;
      for await (const chunk of stream) {
        if (aborted) return;
        callback(chunk);
      }
    })(),
  };
  return streamState;
};
