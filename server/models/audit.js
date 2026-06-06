const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },

    signer: {
      type: String,
    },

    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Audit",
  auditSchema
);