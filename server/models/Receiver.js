const mongoose = require("mongoose");

const receiverSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  expiryDate: {
    type: String,
  },

  x: {
  type: Number,
},

y: {
  type: Number,
},

x: {
  type: Number,
  default: 150,
},

y: {
  type: Number,
  default: 150,
},
});

module.exports = mongoose.model(
  "Receiver",
  receiverSchema
);