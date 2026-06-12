const express = require("express");
const router = express.Router();
const Receiver = require("../models/Receiver");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const receivers = req.body;

    await Receiver.insertMany(receivers);

    for (const receiver of receivers) {
      await sendEmail(
        receiver.email,
        "Document Signature Request",
        `Hello ${receiver.name},

You have been invited to sign a document.

Role: ${receiver.role}

Open this link to sign:

http://localhost:5173/sign/${receiver.fileId}

Thank you.`
      );
    }

    res.json({
      message: "Receivers Saved",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to save receivers",
    });
  }
});

router.get("/:fileId", async (req, res) => {
  try {
    const receivers = await Receiver.find({
      fileId: req.params.fileId,
    });

    res.json(receivers);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to load receivers",
    });
  }
});

module.exports = router;