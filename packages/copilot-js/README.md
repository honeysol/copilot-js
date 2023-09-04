# copilot-js

copilot-js is a library that provides an autocompletion for LLM. 

# Background
LLM has changed people's work and lives significantly. However, it does not always return the correct answer and has limited applications. Copilot UI dramatically expands the applications of LLM by allowing collaboration between LLM and humans. For this, high-quality Copilot components are essential for the development of humans with LLM.

# Features
- Easy-to-use UI specialized for natural language input
- Support for text-only or text-containing HTML
- Provide helpers

# Remark
This library converts pure DOM element into copilot.
If you want to use it with React, use [copilot-react](../copilot-react/README.md).

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


# Guide for developers

## Installation

To install copilot-js, you can use npm:

npm i copilot-js

## Step 1 Create a completion handler.

Use helpers in "./dist/helper/*" or write a handler by yourself.
See samples in files: 

| API sample | Description |
|--------------|-------------|
| [/packages/demo/src/api/completion_sse.ts](../demo/src/api/completion_sse.ts) | API sample for fetch that responds server-sent event |
| [/packages/demo/src/api/completion_text.ts](../demo/src/api/completion_text.ts) | API sample for fetch that responds text stream |
| [/packages/demo/src/api/completion_openai.ts](../demo/src/api/completion_openai.ts) | API sample for OpenAI library |

## Step 2 Create a copilot object.

```ts
const copilot = new CopilotEngine({
  handler: callCompletion, // handler to completion API
  onChange: (text) => console.log(text), // event handler to get content
  value: value, // initial value
  container: document.getElementById("#container"),
})
```

## Step 3 Change parameter in runtime (if needed)

All constructor parameters except `container` can be changed in runtime.

```ts
copilot.handler = newHandler;
copilot.onChange =  (text) => console.log("new event handler", text);
copilot.value = value;
```

When `value` changes, the cursor and completion state will be reset.

# Examples

See [/packages/demo/src/index.tsx](/../demo/src/index.tsx)

# API Reference

## CopilotEngine

Engine to handle completion. You can convert any DIV element to a completion-enabled editor.

### Constructor

```ts
new CopilotEngine(params: {
  value: string;
  textOnly?: boolean = true;
  onChange?: (value: string) => void;
  delay?: number;
  handler: CompletionHandler;
  errorHandler?: ErrorHandler;
  element: HTMLDivElement
}): CopilotEngine

interface CopilotEngine {
  value: string;
  textOnly?: boolean;
  onChange?: (value: string) => void;
  delay?: number;
  handler: CompletionHandler;
  errorHandler?: ErrorHandler;
}

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
### Parameters

- `params`: An object with the following properties:
  - `handler`: Completion handler.
  - `element`  The DIV element to be converted to a completion-enabled editor
  - `value`: Initial value.
  - `textOnly` (optional): If true, only text can be inserted. Default true.
  - `onChange` (optional): Callback when the value is changed.
  - `delay` (optional): Delay to start automatic completion. If not specified, completion will not start automatically.
  - `errorHandler` (optional): Error handler, callback error in CompletionHandler.


### Fields

- `handler`: Completion handler.
- `element`  The DIV element to be converted to a completion-enabled editor
- `value`: Initial value.
- `textOnly` (optional): If true, only text can be inserted. Default true.
- `onChange` (optional): Callback when the value is changed.
- `delay` (optional): Delay to start automatic completion. If not specified, completion will not start automatically.
- `errorHandler` (optional): Error handler, callback error in CompletionHandler.
