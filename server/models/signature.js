const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    signer: {
      type: String,
      required: true,
    },
    token: {
  type: String,
},

    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

   status: {
  type: String,
  enum: ["pending", "signed", "rejected"],
  default: "pending",
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Signature",
  signatureSchema
);