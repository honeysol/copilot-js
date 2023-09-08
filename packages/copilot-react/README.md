# copilot-react

React component that provides an autocompletion for LLM. 

# Background
LLM has changed people's work and lives significantly. However, it does not always return the correct answer and has limited applications. Copilot UI dramatically expands the applications of LLM by allowing collaboration between LLM and humans. For this, high-quality Copilot components are essential for the development of humans with LLM.

# Features
- Easy-to-use UI specialized for natural language input
- Support for text-only or text-containing HTML
- Provide helpers

# Demo
See [/packages/demo](../demo/README.md)

# Guide for users

## normal state:
| Key | Action |
|-----|--------|
| Ctrl+Enter | Start completion |

## completion state:
| Key | Action |
|-----|--------|
| Esc | Collapse completion |
| Character Key | Collapse completion and insert pressed key |

Unlike Github copilot, you can perform operations such as arrow keys, copy, and paste even during completion.

# Quick Example
See [/packages/demo/src/index.tsx](../demo/src/index.tsx) for details.

```tsx
import { fromFetchSSEStream } from "copilot-js/dist/helpers/fromFetchSSEStream";

export const callCompletion = ({
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
      callback(data.choices[0].text);
    },
    controller,
    responsePromise,
  });
};

const Component = () => {
  const instruction = "write a novel.";
  const [text, setText] = useState<string>("");
  const copilotProps: Pick<
    ComponentProps<typeof Copilot>,
    "onChange" | "handler" | "errorHandler"
  >() => {
    useMemo(
    () => ({
      style: {
        width: "300px",
        minHeight: "100px",
        padding: "5px",
        border: "1px solid #ccc",
        height: "200px",
        overflowY: "auto",
        scrollBehavior: "smooth",
      },
      onChange: (value: string) => {
        setText(value);
      },
      handler: (params) => {
        return callCompletion({
          ...params,
          apiKey: process.env.OPENAI_API_KEY,
          text: instruction,
        });
      },
      errorHandler: async (e) => {
        if (e instanceof FetchResponseError) {
          alert(e.data.error?.message);
        }
      },
    }),
    [apiKey, instruction],
  );
  return <Copilot textOnly={true} value={text} {...copilotProps} />
}

```

# Guide for developers

## Installation

To install copilot-react, you can use npm:

npm i copilot-react

## Step 1 Create a completion handler.

Use helpers in "./dist/helper/*" or write a handler by yourself.
See samples in files: 

| API sample | Description |
|--------------|-------------|
| [/packages/demo/src/api/completion_sse.ts](../demo/src/api/completion_sse.ts) | API sample for fetch() that responds to server-sent event (can also be used for OpenAI API)|
| [/packages/demo/src/api/completion_text.ts](../demo/src/api/completion_text.ts) | API sample for fetch() that responds to text stream |
| [/packages/demo/src/api/completion_openai.ts](../demo/src/api/completion_openai.ts) | API sample for OpenAI official library |

## Step2 Use React component

See [/packages/demo/src/index.tsx](../demo/src/index.tsx) for details.

# API Reference

## Copilot

Component to handle completion

```tsx
<Copilot
  {...{
    value: string;
    textOnly?: boolean = true;
    onChange?: (value: string) => void;
    delay?: number;
    handler: CompletionHandler;
    errorHandler?: ErrorHandler;
    className?: string;
    style?: CSSProperties;

  }}
/>

type CompletionHandler = (params: {
  precedingText?: string | undefined;
  followingText?: string | undefined;
  callback: (output: string) => void;
}) => StreamState;

type StreamState = {
  abort: () => void;
  promise: Promise<void>;
};

type ErrorHandler = (error: any) => void;

```
### Props

- `handler`: Completion handler.
- `value`: Initial value.
- `textOnly` (optional): If true, only text can be inserted. Default true.
- `onChange` (optional): Callback when the value is changed.
- `delay` (optional): Delay to start automatic completion. If not specified, completion will not start automatically.
- `errorHandler` (optional): Error handler, callback error in CompletionHandler.
- `style` (optional): The style object to apply to the component.
- `className` (optional): The CSS class to apply to the component.
