/**
 * Retrieves the innerText of an unattached HTMLElement.
 *
 * When attempting to get `innerText` from an element that's not attached to the DOM,
 * certain elements (like <br>) might not be processed correctly. This function temporarily
 * attaches the element to the DOM (in a way that it's not visible to the user), fetches
 * the `innerText`, and then removes it, to ensure the accurate representation of its text content.
 *
 * @param node - The HTMLElement from which to retrieve the innerText.
 * @returns The innerText of the provided node.
 */
const getInnerTextOfUnattachedElement = (node: HTMLElement) => {
  node.style.opacity = "0";
  node.style.position = "absolute";
  node.style.pointerEvents = "none";
  node.style.right = "-100px";
  node.style.width = "0";
  document.body.appendChild(node);
  const text = node.innerText;
  document.body.removeChild(node);
  return text;
};

type textMode = "unattached" | "direct" | "manual";

const getTextOfRange = (
  range: Range,
  pruner?: (node: Element) => void,
  mode?: textMode,
) => {
  const fragment = range.cloneContents();
  const div = document.createElement("div");
  div.appendChild(fragment);
  pruner?.(div);
  if (mode === "direct") {
    return div.innerText;
  } else if (mode === "manual") {
    const isBlockElement = (element: HTMLElement) => {
      const display = window.getComputedStyle(element).display;
      return ["block", "flex", "grid", "table"].includes(display);
    };
    const isBrElement = (element: HTMLElement) => {
      return element.tagName.toLowerCase() === "br";
    };
    const fragments: string[] = [];
    let state: undefined | "br" | "block";
    const traverse = (node: Node) => {
      if (node instanceof Text) {
        state = undefined;
        if (node.textContent) {
          fragments.push(node.textContent);
        }
      } else if (node instanceof HTMLElement) {
        if (isBrElement(node)) {
          state = "br";
          fragments.push("\n");
        } else if (isBlockElement(node)) {
          if (state !== "block") {
            fragments.push("\n");
          }
          state = "block";
          node.childNodes.forEach(traverse);
          if (state !== "block") {
            fragments.push("\n");
          }
          state = "block";
        } else {
          node.childNodes.forEach(traverse);
        }
      }
    };
    traverse(div);
    return fragments.join("");
  } else {
    return getInnerTextOfUnattachedElement(div);
  }
};

export const getTextBeforeNode = (
  containerNode: Node | undefined | null,
  node: Node,
  offset: number,
  pruner?: (node: Element) => void,
  mode?: textMode,
) => {
  if (!containerNode) return;
  const range = document.createRange();
  range.setStart(containerNode, 0);
  range.setEnd(node, offset);
  return getTextOfRange(range, pruner, mode);
};

export const getTextAfterNode = (
  containerNode: Node | undefined | null,
  node: Node,
  offset: number,
  pruner?: (node: Element) => void,
  mode?: textMode,
) => {
  if (!containerNode) return;
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(containerNode, containerNode.childNodes.length);
  return getTextOfRange(range, pruner, mode);
};

export const getTextBeforeCursor = (
  containerNode: Node | undefined | null,
  pruner?: (node: Element) => void,
  mode?: textMode,
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  return getTextBeforeNode(containerNode, node, offset, pruner, mode);
};

export const getTextBeforeSelectionStart = (
  containerNode: Node | undefined | null,
  pruner?: (node: Element) => void,
  mode?: textMode,
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const offset = range.startOffset;
  return getTextBeforeNode(containerNode, node, offset, pruner, mode);
};

export const getTextAfterCursor = (
  containerNode: Node | undefined | null,
  pruner?: (node: Element) => void,
  mode?: textMode,
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  return getTextAfterNode(containerNode, node, offset, pruner, mode);
};

export const getText = (
  containerNode: Element | undefined | null,
  pruner: (node: Element) => void,
) => {
  if (!containerNode) return "";
  const node = containerNode.cloneNode(true) as Element;
  pruner(node);
  if (!(node instanceof HTMLElement)) return "";
  return getInnerTextOfUnattachedElement(node).replace(/\n$/, "");
};
