# JS Copilot

JS Copilot is a library that provides a high quaulity autocompletion of LLM. 

# Background
LLM has changed people's work and life significantly. However, it does not always return the right answer, and therefore has limited applications. Copilot UI greatly expands the applications of LLM by allowing collaboration between LLM and humans. For this, high-quality Copilot components are essential for the development of humans with LLM.

# Features
- Easy to use UI specialized for natural language input
- Support for text-only or text containing HTML
- Provide helpers for OpenAI library, SSE stream and text stream.

# Remark
This library convert pure DOM element into copilot.
If you want to use it with React, use [react-copilot](/packages/react-copilot/README.md).

# Demo
See [/packages/demo](/packages/demo/README.md)


# Guide for users

### normal state:
| Key | Action |
|-----|--------|
| Ctrl+Enter | Start completion |

### completion state:
| Key | Action |
|-----|--------|
| Esc | Collapse completion |
| Character Key | Collapse completion and insert pressed key |

Unlike Github copilot, you can perform operations such as arrow keys, copy, and paste even during completion.


# Guide for developers


## Installation

To install JS Copilot, you can use npm:

npm i js-copilot

## Step 1 Create completion handler.

Use helpers in "./dist/helper/*" or write a handler by yourself.
See samples in files: 

| API sample | Description |
|--------------|-------------|
| /packages/demo/src/api/completion_sse.ts | API sample for server-sent event completion |
| /packages/demo/src/api/completion_text.ts | API sample for text-only completion |
| /packages/demo/src/api/completion_openai.ts | API sample for OpenAI completion |

## Step 2 Create copilot object.

```ts
const copilot = new CopilotEngine({
  handler: callCompletion, // handler to completion API
  onChange: (text) => console.log(text), // event handler to get content
  value: value, // initial value
  container: document.getElementById("#container"),
})
```

### Step 3 Change parameter in runtime (if needed)

All parameters of constructor except `container` can be changed in runtime.

```ts
copilot.handler = newHandler;
copilot.onChange =  (text) => console.log("new event handler", text);
copilot.value = value;
```

When `value` is changed, cursor and completion state should be reset.

# Examples

See [/packages/demo/src/index.tsx](/packages/demo/src/index.tsx)
