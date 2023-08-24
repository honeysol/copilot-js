import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import { Copilot } from "react-copilot";
import { callCompletion } from "./api/completion";

const App = () => {
  const [instruction, setInstruction] = useState<string>(
    "Write novel in Japanese.",
  );
  const [text, setText] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("apiKey") || "",
  );
  const [saveApiKey, setSaveApiKey] = useState<boolean>(!!apiKey);
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
            style={{
              width: "300px",
              minHeight: "100px",
              padding: "5px",
              border: "1px solid #ccc",
              height: "200px",
              overflowY: "auto",
              scrollBehavior: "smooth",
            }}
            handler={(params) => {
              const response = callCompletion({
                ...params,
                apiKey,
                text: instruction,
              });
              (async () => {
                try {
                  await response.promise;
                } catch (e) {
                  console.error(e);
                  if (e instanceof Response) {
                    const data = await e.json();
                    alert(data.error?.message);
                  }
                }
              })();
              return response;
            }}
            textOnly={false}
            onChange={(text) => setText(text)}
            value={text}
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
        onClick={(e) => {
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
