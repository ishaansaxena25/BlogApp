const { randomBytes } = require("crypto");
const slugify = require("slugify");

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function contentText(content) {
  return (content?.blocks || [])
    .flatMap((block) => {
      if (block.type === "paragraph" || block.type === "header") {
        return [stripHtml(block.data.text)];
      }
      if (block.type === "list") {
        const flatten = (items = []) =>
          items.flatMap((item) =>
            typeof item === "string"
              ? stripHtml(item)
              : [stripHtml(item.content), ...flatten(item.items)]
          );
        return flatten(block.data.items);
      }
      return [];
    })
    .filter(Boolean)
    .join(" ");
}

function calculateReadingTime(content) {
  const words = contentText(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function createExcerpt(content) {
  const paragraph = (content?.blocks || []).find(
    (block) => block.type === "paragraph"
  );
  return stripHtml(paragraph?.data?.text).slice(0, 300);
}

async function createUniqueSlug(title, BlogModel, excludeId) {
  const base = slugify(title, { lower: true, strict: true }) || "post";
  let slug = base;
  let exists = await BlogModel.exists({
    slug,
    ...(excludeId && { _id: { $ne: excludeId } }),
  });
  if (exists) {
    slug = `${base}-${randomBytes(3).toString("hex")}`;
    exists = await BlogModel.exists({
      slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    });
  }
  if (exists) slug = `${base}-${randomBytes(6).toString("hex")}`;
  return slug;
}

module.exports = {
  stripHtml,
  contentText,
  calculateReadingTime,
  createExcerpt,
  createUniqueSlug,
};
