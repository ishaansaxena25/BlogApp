const { validationResult } = require("express-validator");
const fs = require("fs/promises");

async function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    return res.status(400).json({ errors: errors.array() });
  }

  return next();
}

module.exports = validate;
