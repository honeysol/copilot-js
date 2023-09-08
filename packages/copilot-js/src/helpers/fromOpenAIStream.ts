import { StreamState } from "..";
import { fromAsyncIterable } from "./fromAsyncIterable";

/**
 * Redefined type to correspond to the OpenAI Node API Library.
 * @description This type is identical to a generic AsyncIterable that represents a stream of data.
 * @template T The type of the data that the stream emits.
 */
type Stream<T> = AsyncIterable<T>;

/**
 * Redefined type to correspond to the OpenAI Node API Library.
 * @description This type is identical to a generic Promise<T>.
 * @template T The type of the value that the Promise resolves to.
 */
type APIPromise<T> = Promise<T>;

/**
 * Creates an observable stream from a OpenAI Stream object.
 * @description This function is a wrapper of fromAsyncIterable and improves the behavior of aborting the stream.
 * @param {function} callback A function to be called for each SSE data event.
 * @param {object} streamPromise A promise that resolves to  OpenAI Stream object.
 * @returns {StreamState} An observable stream.
 */
export const fromOpenAIStream = <T>(
  streamPromise: APIPromise<Stream<T>>,
  callback: (chunk: T) => void,
): StreamState => {
  return fromAsyncIterable<T, Stream<T> & { controller: AbortController }>(
    streamPromise as APIPromise<Stream<T> & { controller: AbortController }>,
    callback,
    (stream) => {
      // This specification is written in the document of OpenAI Node API Library
      // But it is defined as private in the .d.ts file
      // https://github.com/openai/openai-node
      stream.controller?.abort?.();
    },
  );
};
