React component for Copilot 

# Background
LLM has changed people's work and life significantly. However, it does not always return the right answer, and therefore has limited applications. Copilot UI greatly expands the applications of LLM by allowing collaboration between LLM and humans. For this, high-quality Copilot components are essential for the development of humans with LLM.

# Features
- Easy to use UI specialized for natural language input
- Support for text-only or text containing HTML
- Provide helpers for OpenAI library, SSE stream and text stream.

# Example
See [/packages/demo/src/index.tsx](/packages/demo/src/index.tsx) for detail.

```tsx
const Component = () => {
  // Omitted
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
          apiKey,
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

# API Reference

## Copilot

Component to handle completion.

```tsx
<CopilotEngine
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

- `value`: Initial value.
- `textOnly` (optional): If true, only text can be inserted. Default true.
- `onChange` (optional): Callback when value is changed.
- `delay` (optional): Delay to start automatic completion. If not specified, completion will not start automatically.
- `handler`: Completion handler.
- `errorHandler` (optional): Error handler, callback error in CompletionHandler.
- `style` (optional): The style object to apply to the component.
- `className` (optional): The CSS class to apply to the component.

