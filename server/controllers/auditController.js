const Audit = require("../models/audit");

const getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.find({
      fileId: req.params.fileId,
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAuditLogs,
};