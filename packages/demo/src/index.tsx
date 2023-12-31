import React, { ComponentProps, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { Copilot } from "copilot-react";
import { callCompletion_sse as callCompletion } from "./api/completion_sse";
import { FetchResponseError } from "copilot-js/dist/helpers/fromFetchTextStream";

const App = () => {
  const [instruction, setInstruction] = useState<string>(
    "Write novel in Japanese.",
  );
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const [textOnly, setTextOnly] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("apiKey") || "",
  );
  const [saveApiKey, setSaveApiKey] = useState<boolean>(!!apiKey);
  const copilotProps: Pick<
    ComponentProps<typeof Copilot>,
    "onChange" | "handler" | "errorHandler" | "style" | "onSelectionChange"
  > = useMemo(
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
      onSelectionChange: ({
        selectionStart,
        selectionEnd,
      }: {
        selectionStart: number;
        selectionEnd: number;
      }) => {
        if (outputRef.current) {
          console.log(selectionStart, selectionEnd, outputRef);
          outputRef.current.selectionStart = selectionStart;
          outputRef.current.selectionEnd = selectionEnd;
        }
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

  return (
    <>
      <h1>React Copilot Demo</h1>
      <div
        style={{
          display: "flex",
        }}
      >
        <div style={{}}>
          <div style={{}}>Copilot</div>
          <Copilot
            {...copilotProps}
            textOnly={textOnly}
            value={text}
            placeholder="Write something with support of copilot."
          />
          Ctrl+Enter: Start completion <br />
          Esc: Close completion
        </div>

        <div style={{ marginLeft: "20px" }}>
          <div style={{}}>Instruction</div>
          <textarea
            style={{
              height: "200px",
              width: "200px",
              border: "1px solid #ccc",
            }}
            onChange={(e) => {
              setInstruction(e.target.value);
            }}
            value={instruction}
          ></textarea>
        </div>
        <div style={{ marginLeft: "20px" }}>
          <div style={{}}>Generated text</div>
          <textarea
            ref={outputRef}
            style={{
              height: "200px",
              width: "200px",
              border: "1px solid #ccc",
            }}
            onChange={(e) => {
              setText(e.target.value);
            }}
            onPaste={(e) => {
              setText(e.currentTarget.value);
            }}
            onDrop={(e) => {
              setText(e.currentTarget.value);
            }}
            value={text}
          ></textarea>
        </div>
        <div style={{ marginLeft: "20px" }}>
          <div style={{}}>Options</div>
          Text Only
          <input
            type="checkbox"
            onChange={(e) => {
              setTextOnly(e.currentTarget.checked);
            }}
            checked={textOnly}
          />
        </div>
      </div>
      OpenAI API Key
      <input
        type="password"
        onChange={(e) => {
          setApiKey(e.currentTarget.value);
          if (saveApiKey) {
            localStorage.setItem("apiKey", e.currentTarget.value);
          }
        }}
        value={apiKey}
      />
      &nbsp; Save API key
      <input
        type="checkbox"
        onChange={(e) => {
          setSaveApiKey(e.currentTarget.checked);
          if (e.currentTarget.checked) {
            localStorage.setItem("apiKey", apiKey);
          } else {
            localStorage.removeItem("apiKey");
          }
        }}
        checked={saveApiKey}
      />
      &nbsp;
      <button
        type="button"
        onClick={() => {
          setSaveApiKey(false);
          setApiKey("");
          localStorage.removeItem("apiKey");
        }}
      >
        Clear API key
      </button>
      <br />
      (API key is stored in your browser only and is not sent anywhere except
      OpenAI.)
    </>
  );
};

const app = <App />;

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(app);
}
