const Document = require("../models/document");

const uploadDocument = async (req, res) => {
  try {
    const document = await Document.create({
      filename: req.file.filename,
      filepath: req.file.path,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
};