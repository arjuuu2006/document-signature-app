const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const {
  uploadDocument,
  getDocuments,
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

module.exports = router;