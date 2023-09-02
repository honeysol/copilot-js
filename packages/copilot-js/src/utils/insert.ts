type NodeLike = Node | Node[] | string;

/**
 * @description Move the cursor position to either before or after the given nodes.
 * @param {Node[]} nodes - An array of nodes where the cursor position needs to be moved.
 * @param {"before" | "after" | undefined} cursor - Optional. Determines the position where the cursor should be moved.
 *                 Can be "before" or "after". If not provided, no operation will be performed.
 * @returns void
 */
const moveCursorAtNode = (nodes: Node[], cursor?: "before" | "after") => {
  if (!cursor) return;
  const selection = window.getSelection();
  if (!selection) return;
  const node = nodes[cursor === "after" ? nodes.length - 1 : 0];
  if (node instanceof Text) {
    selection.setPosition(node, cursor === "after" ? node.length : 0);
  } else {
    const parentElement = node.parentElement;
    if (!parentElement) return;
    const index = Array.from(parentElement.childNodes).indexOf(
      node as ChildNode,
    );
    if (index < 0) throw new Error("internal error");
    selection.setPosition(parentElement, index + (cursor === "after" ? 1 : 0));
  }
};

/**
 * @description Inserts a node (or multiple nodes) into a parent node at a specified location.
 * After insertion, it can optionally move the cursor before or after the inserted nodes.
 *
 * @param nodeToInsert - The node (or nodes) to be inserted. This can be a single Node,
 *                       an array of Nodes, or a string.
 * @param parentNode  - The node where the `nodeToInsert` will be added. If not provided, no operation will be performed.
 * @param nextNode    - The node after which the `nodeToInsert` will be added.
 *                       If not provided, `nodeToInsert` will be appended at the end of `parentNode`.
 * @param cursor      - Optional. Determines the position where the cursor should be moved after insertion.
 *                       Can be "before" or "after" the inserted nodes. If not provided, cursor won't be moved.
 * @returns void
 */
const insertNode = (
  nodeToInsert: NodeLike,
  parentNode: Node | null,
  nextNode?: Node | null,
  cursor?: "after" | "before",
) => {
  if (!parentNode) return;
  const nodesToInsert = (() => {
    if (Array.isArray(nodeToInsert)) {
      return nodeToInsert;
    } else if (typeof nodeToInsert === "string") {
      const tempNode = document.createElement("span");
      tempNode.innerText = nodeToInsert;
      return Array.from(tempNode.childNodes);
    } else {
      return [nodeToInsert];
    }
  })();
  if (nextNode) {
    for (const nodeToInsert of nodesToInsert) {
      parentNode.insertBefore(nodeToInsert, nextNode);
    }
  } else {
    for (const nodeToInsert of nodesToInsert) {
      parentNode.appendChild(nodeToInsert);
    }
  }
  setTimeout(() => {
    moveCursorAtNode(nodesToInsert, cursor);
    parentNode.normalize();
  }, 0);
};

/**
 * Inserts a node (or nodes) at the current cursor position within the browser's content-editable area.
 *
 * This function uses the current selection (or cursor position) to determine where to insert
 * the node. Optionally, the cursor can be moved after or before the inserted node.
 *
 * Note: If inserting within a text node, and the node doesn't have a trailing line break (`<BR>` element),
 * one will be added to ensure proper innerText of content-editable element.
 *
 * @param nodeToInsert - The node, nodes or string to be inserted.
 * @param cursor      - Optional. Determines the position where the cursor should be moved after insertion.
 *                       Can be "before" or "after" the inserted nodes. If not provided, cursor won't be moved.
 * @returns void
 */
const insertAtCursor = (
  nodeToInsert: NodeLike,
  cursor?: "after" | "before",
) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;
  if (node instanceof Text) {
    const hasBr = (function isBr(node) {
      return node && node instanceof Element && node.nodeName === "BR";
    })(node.parentNode?.lastChild);
    if (!hasBr) node.parentNode?.appendChild(document.createElement("BR"));
    if (offset < node.length) node.splitText(offset);
    insertNode(nodeToInsert, node.parentNode, node.nextSibling, cursor);
  } else if (node instanceof Element) {
    insertNode(nodeToInsert, node, node.childNodes[offset], cursor);
  }
};

const collapseSelection = () => {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
};

export const insertAfterCursor = (nodeToInsert: NodeLike, collapse = false) => {
  if (collapse) collapseSelection();
  return insertAtCursor(nodeToInsert, "before");
};

export const insertBeforeCursor = (nodeToInsert: NodeLike, collapse = true) => {
  if (collapse) collapseSelection();
  return insertAtCursor(nodeToInsert, "after");
};

export const insertBeforeNode = (nodeToInsert: NodeLike, node: Node) => {
  insertNode(nodeToInsert, node.parentElement, node, "after");
};

export const insertAfterNode = (nodeToInsert: NodeLike, node: Node) => {
  insertNode(nodeToInsert, node.parentElement, node.nextSibling, "before");
};

export const appendNode = (nodeToInsert: NodeLike, node: Node) => {
  insertNode(nodeToInsert, node);
};
