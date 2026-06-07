const express = require("express");
const router = express.Router();

const {
  createSignature,
  getSignatures,
  generateSignedPdf,
  updateSignatureStatus,
} = require("../controllers/signatureController");

// Save signature
router.post("/", createSignature);

// Generate signed PDF
router.get("/generate/:fileId", generateSignedPdf);

// Get signatures by file ID
router.get("/:fileId", getSignatures);
router.put(
  "/:id/status",
  updateSignatureStatus
);

module.exports = router;
