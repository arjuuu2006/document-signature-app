const Document = require("../models/document");

// Upload Document
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

// Get User Documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      uploadedBy: req.user.id,
    });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const document = await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  updateDocumentStatus,
};