// This filter removes the first empty line.
export const createFilter = (
  callback: (chunk: string) => void,
  disabled: boolean,
) => {
  let isFirst = true;
  return (textChunk: string) => {
    if (disabled) {
      callback(textChunk);
    } else {
      const filteredChunk = isFirst ? textChunk.replace(/^\n+/, "") : textChunk;
      if (!filteredChunk) return;
      isFirst = false;
      callback(filteredChunk);
    }
  };
};
