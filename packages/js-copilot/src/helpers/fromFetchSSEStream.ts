import { fromFetchTextStream } from "./fromFetchTextStream";

const createServerSentEventHandler = <T>(callback: (data: T) => void) => {
  let buffer = "";
  return (chunk: string) => {
    buffer += chunk;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const match = buffer.match(/^(.*)\n([\s\S]*)$/m);
      if (!match) break;
      buffer = match[2];
      const line = match[1];
      if (!line) continue;
      const payload = line.replace(/^data: /, "");
      if (payload === "[DONE]") break;
      callback(JSON.parse(payload));
    }
  };
};

export const fromFetchSSEStream = <T>({
  callback,
  controller,
  responsePromise,
}: {
  callback: (data: T) => void;
  controller: AbortController;
  responsePromise: Promise<Response>;
}) => {
  return fromFetchTextStream({
    callback: createServerSentEventHandler<T>(callback),
    controller,
    responsePromise,
  });
};
