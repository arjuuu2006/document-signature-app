const Signature = require("../models/signature");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { v4: uuidv4 } = require("uuid");
const Document = require("../models/document");

const createSignature = async (req, res) => {

  try {
    const { fileId, signer, x, y } = req.body;

   const token = uuidv4();

const signature = await Signature.create({
  fileId,
  signer,
  x,
  y,
  token,
});

res.status(201).json({
  message: "Signature created",
  signature,
  publicLink: `http://localhost:5001/sign/${token}`,
});  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSignatures = async (req, res) => {
  try {
    const signatures = await Signature.find({
      fileId: req.params.fileId,
    });

    res.status(200).json(signatures);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const generateSignedPdf = async (req, res) => {
  try {
    const { fileId } = req.params;

    const document = await Document.findById(fileId);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const signatures = await Signature.find({ fileId });

    const existingPdfBytes = fs.readFileSync(document.filepath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();

    const firstPage = pages[0];

    signatures.forEach((sig) => {
      firstPage.drawText(sig.signer, {
        x: sig.x,
        y: sig.y,
        size: 20,
      });
    });

    const pdfBytes = await pdfDoc.save();

    const signedPath = path.join(
      __dirname,
      "../uploads",
      `signed-${document.filename}`
    );

    fs.writeFileSync(signedPath, pdfBytes);

    res.status(200).json({
      message: "Signed PDF generated",
      file: signedPath,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createSignature,
  getSignatures,
  generateSignedPdf,
};