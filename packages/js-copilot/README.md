# JS Copilot

JS Copilot is a library that provides a high quaulity autocompletionfeatures for any DIV element. It can be used in web applications to enhance the user experience.

If you want to use it with React, use react-copilot.

If you want to replace the textarea, you can use a technique of specifying display: none in the text area and inserting the Copilot component in the same location.

## Usage for users

### normal state:
Ctrl+Enter: Start completion

### completion state:
Esc: Stop and collapse completion

Unlike Github copilot, you can perform operations such as arrow keys, copy, and paste even during completion.


## Usage for developers
### Step 1
Create completion handler.

Use helpers in "./dist/helper/*" or write a handler by yourself.

```ts
import { fromFetchSSEStream } from "js-copilot/dist/helpers/fromFetchSSEStream";

const callCompletion = ({
  text,
  precedingText,
  callback,
}: {
  text: string;
  precedingText?: string;
  callback: (output: string) => void;
}) => {
  const controller = new AbortController();
  const responsePromise = fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAPI_SECRET_KEY}`,
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
      callback(data.choices[0].text);
    },
    controller,
    responsePromise: responsePromise,
  });
};
```

### Step 2

Prepare DIV element

### Step 3
Create copilot.

```ts
const copilot = new CopilotEngine({
  handler: callCompletion, // handler to completion API
  onChange: (text) => console.log(text), // event handler to get content
  value: value, // initial value
  container: document.getElementById("#container"),
})
```
All parameters except `container` can be changed in runtime.
```ts
copilot.handler = newHandler;
copilot.onChange =  (text) => console.log("new event handler", text);
copilot.value = value;
```
When `value` is changed, cursor and completion state should be reset.

### 

## Completion handler

### from Stream object of `openai` library

```ts
import OpenAI from "openai";
import { fromOpenAIStream } from "js-copilot/dist/helpers/fromOpenAIStream";

const callCompletion_openai = ({
  text,
  precedingText,
  callback,
}: {
  text: string;
  precedingText?: string;
  callback: (output: string) => void;
}) => {
  const openai = new OpenAI({
    apiKey: env.OPENAPI_SECRET_KEY,
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
    callback(chunk.choices[0].text);
  });
};
```

### from response of fetch API that returns text stream

```ts
import { fromFetchTextStream } from "js-copilot/dist/helpers/fromFetchTextStream";

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
    callback,
    controller,
    responsePromise: responsePromise,
  });
};
```

### from response of fetch API that returns Server Side Event

```ts
import { fromFetchSSEStream } from "js-copilot/dist/helpers/fromFetchSSEStream";

const callCompletion = ({
  text,
  precedingText,
  callback,
}: {
  text: string;
  precedingText?: string;
  callback: (output: string) => void;
}) => {
  const controller = new AbortController();
  const responsePromise = fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAPI_SECRET_KEY}`,
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
      callback(data.choices[0].text);
    },
    controller,
    responsePromise: responsePromise,
  });
};
```

## Installation

To install JS Copilot, you can use npm: