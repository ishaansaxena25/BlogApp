const { uploadFile } = require("../services/storage");

async function uploadEditorImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: 0, error: "Image is required" });
  }

  const url = await uploadFile(req.file, "editor");
  req.filePersisted = true;
  return res.status(201).json({ success: 1, file: { url } });
}

module.exports = { uploadEditorImage };
