let inEvent = false;
document.addEventListener(
  "focus",
  (e) => {
    if (inEvent) return;
    try {
      inEvent = true;
      const target = e.target;
      if (!target) return;
      if (!(target instanceof Element) || target.tagName !== "TEXTAREA") return;

      const textarea = target as HTMLTextAreaElement;

      const copilotDom = document.createElement("div");

      if (!textarea.parentNode) return;
      textarea.parentNode.insertBefore(copilotDom, textarea);

      copilotDom.setAttribute("contenteditable", "true");

      const getAllStyle = (styles: CSSStyleDeclaration) => {
        const props: Record<string, string> = {};
        for (let i = 0; i < styles.length; i++) {
          const key = styles[i];
          // user-modify conflicts with contenteditable
          if (["-webkit-user-modify", "-moz-user-modify"].includes(key)) {
            continue;
          }
          props[key] = styles.getPropertyValue(key);
        }
        return props;
      };

      const focusedStyles = getAllStyle(getComputedStyle(textarea));
      textarea.blur();
      const normalStyles = getAllStyle(getComputedStyle(textarea));

      copilotDom.addEventListener("focus", function () {
        Object.assign(copilotDom.style, focusedStyles);
      });

      copilotDom.addEventListener("blur", function () {
        Object.assign(copilotDom.style, normalStyles);
      });

      copilotDom.focus();
      textarea.style.display = "none";
    } finally {
      inEvent = false;
    }
  },
  { capture: true },
);
