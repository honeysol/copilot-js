import { fromFetchSSEStream } from "js-copilot/dist/helpers/fromFetchSSEStream";
import { createFilter } from "./filter";

export const callCompletion_sse = ({
  text,
  precedingText,
  followingText,
  callback,
  apiKey,
}: {
  text: string;
  precedingText?: string;
  followingText?: string;
  callback: (output: string) => void;
  apiKey: string;
}) => {
  const filter = createFilter(callback, !!precedingText);
  const controller = new AbortController();
  const responsePromise = fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      stream: true,
      prompt: `#instuction${text}\n#output\n${precedingText}`,
      max_tokens: 2000,
      temperature: 0.5,
      suffix: followingText,
      n: 1,
    }),
    signal: controller.signal,
  });
  return fromFetchSSEStream<{ choices: { text: string }[] }>({
    callback: (data) => {
      filter(data.choices[0].text);
    },
    controller,
    responsePromise,
  });
};
