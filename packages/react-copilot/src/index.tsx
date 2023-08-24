import React, { CSSProperties, useEffect, useRef } from "react";

import { CopilotEngine, CompletionHandler } from "js-copilot";
export type { CompletionHandler };
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
