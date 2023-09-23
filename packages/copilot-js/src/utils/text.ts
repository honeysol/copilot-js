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

const getTextOfRange = (range: Range, pruner?: (node: Element) => void) => {
  const fragment = range.cloneContents();
  const div = document.createElement("div");
  div.appendChild(fragment);
  pruner?.(div);
  return getInnerTextOfUnattachedElement(div);
};

export const getTextBeforeNode = (
  containerNode: Node | undefined | null,
  node: Node,
  offset: number,
  pruner?: (node: Element) => void,
) => {
  if (!containerNode) return;
  const range = document.createRange();
  range.setStart(containerNode, 0);
  range.setEnd(node, offset);
  return getTextOfRange(range, pruner);
};

export const getTextAfterNode = (
  containerNode: Node | undefined | null,
  node: Node,
  offset: number,
  pruner?: (node: Element) => void,
) => {
  if (!containerNode) return;
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(containerNode, containerNode.childNodes.length);
  return getTextOfRange(range, pruner);
};

export const getTextBeforeCursor = (
  containerNode: Node | undefined | null,
  pruner?: (node: Element) => void,
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  return getTextBeforeNode(containerNode, node, offset, pruner);
};

export const getTextBeforeSelectionStart = (
  containerNode: Node | undefined | null,
  pruner?: (node: Element) => void,
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const offset = range.startOffset;
  return getTextBeforeNode(containerNode, node, offset, pruner);
};

export const getTextAfterCursor = (
  containerNode: Node | undefined | null,
  pruner?: (node: Element) => void,
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  return getTextAfterNode(containerNode, node, offset, pruner);
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
