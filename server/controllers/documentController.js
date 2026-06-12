const Document = require("../models/document");
const Signature = require("../models/signature");

const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");

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

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(
      req.params.fileId
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const downloadSignedPdf = async (req, res) => {
  try {
    const document = await Document.findById(
      req.params.fileId
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const signature = await Signature.findOne({
      fileId: document._id,
    });

    const existingPdfBytes = fs.readFileSync(
      document.filepath
    );

    const pdfDoc = await PDFDocument.load(
      existingPdfBytes
    );

    const pages = pdfDoc.getPages();

    const firstPage = pages[0];

    if (signature) {
      firstPage.drawText(signature.signer, {
        x: signature.x,
        y:
          firstPage.getHeight() -
          signature.y,
        size: 24,
        color: rgb(0, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=signed.pdf"
    );

    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  updateDocumentStatus,
  getDocumentById,
  downloadSignedPdf,
};