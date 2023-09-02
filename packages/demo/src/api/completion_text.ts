import { fromFetchTextStream } from "copilot-js/dist/helpers/fromFetchTextStream";
import { createFilter } from "./filter";

export const callCompletion_text = ({
  text,
  precedingText,
  callback,
}: {
  text: string;
  precedingText?: string;
  callback: (output: string) => void;
}) => {
  const filter = createFilter(callback, !!precedingText);
  const controller = new AbortController();
  const responsePromise = fetch("http://127.0.0.1:5001/streamBot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        botId: "openai_completion",
        precedingText: precedingText || "",
        text,
      },
    }),
    signal: controller.signal,
  });
  return fromFetchTextStream({
    callback: filter,
    controller,
    responsePromise: responsePromise,
  });
};
