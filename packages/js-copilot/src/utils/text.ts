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
export const getInnerTextOfUnattachedElement = (node: HTMLElement) => {
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

const getTextOfRange = (range: Range) => {
  const fragment = range.cloneContents();
  const div = document.createElement("div");
  div.appendChild(fragment);
  return getInnerTextOfUnattachedElement(div);
};

const getTextBeforeNode = (
  containerNode: Node | undefined | null,
  node: Node,
  offset: number,
) => {
  if (!containerNode) return;
  const range = document.createRange();
  range.setStart(containerNode, 0);
  range.setEnd(node, offset);
  return getTextOfRange(range);
};

const getTextAfterNode = (
  containerNode: Node | undefined | null,
  node: Node,
  offset: number,
) => {
  if (!containerNode) return;
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(containerNode, containerNode.childNodes.length);
  return getTextOfRange(range);
};

export const getTextBeforeCursor = (containerNode: Node | undefined | null) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  return getTextBeforeNode(containerNode, node, offset);
};

export const getTextAfterCursor = (containerNode: Node | undefined | null) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  return getTextAfterNode(containerNode, node, offset);
};
