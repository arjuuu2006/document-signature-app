const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const {
  uploadDocument,
  getDocuments,
  updateDocumentStatus,
  getDocumentById,
  downloadSignedPdf,
} = require("../controllers/documentController");

router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadDocument
);

router.get(
  "/my-documents",
  protect,
  getDocuments
);

router.put(
  "/status/:id",
  protect,
  updateDocumentStatus
);

router.get(
  "/file/:fileId",
  getDocumentById
);

router.get(
  "/download/:fileId",
  downloadSignedPdf
);

module.exports = router;