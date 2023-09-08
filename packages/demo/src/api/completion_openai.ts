import OpenAI from "openai";

import { fromOpenAIStream } from "copilot-js/dist/helpers/fromOpenAIStream";
import { createFilter } from "./filter";

export const callCompletion_openai = ({
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
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  const streamPromise = openai.completions.create({
    model: "text-davinci-003",
    stream: true,
    prompt: `#instuction${text}\n#output\n${precedingText}`,
    suffix: followingText,
    max_tokens: 200,
    temperature: 0.5,
    n: 1,
  });
  return fromOpenAIStream(streamPromise, (chunk) => {
    filter(chunk.choices[0].text);
  });
};
