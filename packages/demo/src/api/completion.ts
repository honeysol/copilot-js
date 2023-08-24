import OpenAI from "openai";

import { fromOpenAIStream } from "js-copilot/dist/helpers/fromOpenAIStream";
import { fromFetchSSEStream } from "js-copilot/dist/helpers/fromFetchSSEStream";
import { fromFetchTextStream } from "js-copilot/dist/helpers/fromFetchTextStream";

// This filter removes the first empty line.
const createFilter = (callback: (chunk: string) => void, disabled: boolean) => {
  let isFirst = true;
  return (textChunk: string) => {
    if (disabled) {
      callback(textChunk);
    } else {
      const filteredChunk = isFirst ? textChunk.replace(/^\n+/, "") : textChunk;
      if (!filteredChunk) return;
      isFirst = false;
      callback(filteredChunk);
    }
  };
};

const callCompletion_openai = ({
  text,
  precedingText,
  callback,
  apiKey,
}: {
  text: string;
  precedingText?: string;
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
    prompt: `#instuction${text}}\n#output\n${precedingText}`,
    max_tokens: 200,
    temperature: 0.5,
    n: 1,
  });
  return fromOpenAIStream(streamPromise, (chunk) => {
    filter(chunk.choices[0].text);
  });
};

const callCompletion_sse = ({
  text,
  precedingText,
  callback,
  apiKey,
}: {
  text: string;
  precedingText?: string;
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
      prompt: `#instuction${text}}\n#output\n${precedingText}`,
      max_tokens: 200,
      temperature: 0.5,
      n: 1,
    }),
    signal: controller.signal,
  });
  return fromFetchSSEStream<{ choices: { text: string }[] }>({
    callback: (data) => {
      filter(data.choices[0].text);
    },
    controller,
    responsePromise: responsePromise,
  });
};

const callCompletion_text = ({
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

export const callCompletion = callCompletion_sse;
