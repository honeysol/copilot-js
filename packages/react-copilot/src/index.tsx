/**
 * The Copilot component for React.
 * @packageDocumentation
 */

import React, { CSSProperties, useEffect, useRef } from "react";

import { CopilotEngine, CompletionHandler } from "js-copilot";
export type { CompletionHandler };

/**
 * A component that provides text completion functionality using the CopilotEngine.
 * @param {Object} props - The component props.
 * @param {CSSProperties} [props.style] - The style object to apply to the component.
 * @param {string} [props.className] - The CSS class to apply to the component.
 * @param {boolean} [props.textOnly=true] - Whether to only provide text completion or also provide other types of completion.
 * @param {string} props.value - The initial value of the component.
 * @param {(value: string) => void} [props.onChange] - A callback function that is called when the value of the component changes.
 * @param {number} [props.delay] - The delay in milliseconds before the completion engine starts.
 * @param {CompletionHandler} props.handler - The completion handler to use.
 * @returns {JSX.Element} The Copilot component.
 */
export const Copilot = React.memo(function Copilot({
  style,
  className,
  value,
  onChange,
  textOnly = true,
  delay,
  handler,
}: {
  style?: CSSProperties;
  className?: string | undefined;
  textOnly?: boolean;
  value: string;
  onChange?: (value: string) => void;
  delay?: number;
  handler: CompletionHandler;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const copilot = useRef<CopilotEngine>();

  useEffect(() => {
    if (!containerRef.current) return;
    if (!copilot.current) {
      copilot.current = new CopilotEngine({
        textOnly,
        onChange,
        delay,
        handler,
        value,
        element: containerRef.current,
      });
    } else {
      copilot.current.textOnly = textOnly;
      copilot.current.onChange = onChange;
      copilot.current.delay = delay;
      copilot.current.handler = handler;
      copilot.current.value = value;
    }
  });

  useEffect(() => {
    return () => copilot.current?.close();
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        style={style}
        contentEditable={true}
        suppressContentEditableWarning={true}
      >
        <div>
          <br />
        </div>
      </div>
    </>
  );
});
