const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const {
  uploadDocument,
} = require("../controllers/documentController");

router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadDocument
);

module.exports = router;