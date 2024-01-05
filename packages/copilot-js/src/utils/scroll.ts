export const scrollIntoCursor = (container?: Element | null) => {
  if (!container) return;
  const range = window.getSelection()?.getRangeAt(0);
  if (!range) return;

  const getTextRect = (textNode: Text, offset: number) => {
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset);
    return range?.getBoundingClientRect();
  };

  const node = range.startContainer;
  const rect = (() => {
    if (node instanceof Text) {
      return getTextRect(node, range.startOffset);
    } else if (node instanceof Element) {
      const targetNode = node.childNodes[range.startOffset];
      if (!targetNode) {
        return null;
      }
      if (targetNode instanceof Text) {
        return getTextRect(targetNode, 0);
      }
      if (targetNode instanceof Element) {
        return targetNode.getBoundingClientRect();
      }
      console.log("unknown node type", targetNode);
      return null;
    } else {
      console.log("unknown node type", node);
      return null;
    }
  })();
  if (!rect?.height && !rect?.width) {
    return;
  }
  const containerRect = container.getBoundingClientRect();
  container.scrollBy({
    top:
      ((rect?.top || 0) + (rect?.bottom || 0)) / 2 -
      containerRect.top -
      container.clientHeight / 2,
    behavior: "smooth",
  });
};
