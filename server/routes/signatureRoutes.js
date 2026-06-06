const express = require("express");
const router = express.Router();

const {
  createSignature,
  getSignatures,
  generateSignedPdf,
} = require("../controllers/signatureController");

// Save signature
router.post("/", createSignature);

// Generate signed PDF
router.get("/generate/:fileId", generateSignedPdf);

// Get signatures by file ID
router.get("/:fileId", getSignatures);

module.exports = router;