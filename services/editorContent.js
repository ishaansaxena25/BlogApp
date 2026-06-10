const allowedBlockTypes = new Set([
  "paragraph",
  "header",
  "image",
  "quote",
  "checklist",
  "list",
  "code",
  "table",
  "delimiter",
  "embed",
]);

function parseEditorContent(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

function isValidEditorContent(value) {
  const content = parseEditorContent(value);
  const structurallyValid = Boolean(
    content &&
      typeof content === "object" &&
      !Array.isArray(content) &&
      Array.isArray(content.blocks) &&
      content.blocks.length > 0
  );
  return (
    structurallyValid &&
    content.blocks.some((block) => allowedBlockTypes.has(block?.type))
  );
}

function sanitizeEditorContent(value) {
  const content = parseEditorContent(value);
  if (!isValidEditorContent(content)) return null;

  return {
    time: Number(content.time) || Date.now(),
    version: typeof content.version === "string" ? content.version : undefined,
    blocks: content.blocks
      .filter(
        (block) =>
          block &&
          typeof block === "object" &&
          allowedBlockTypes.has(block.type) &&
          block.data &&
          typeof block.data === "object"
      )
      .map((block) => ({
        ...(block.id && { id: String(block.id) }),
        type: block.type,
        data: block.data,
      })),
  };
}

module.exports = {
  allowedBlockTypes,
  parseEditorContent,
  isValidEditorContent,
  sanitizeEditorContent,
};
