const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema({
  callControlId: String,
  from: String,
  to: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CallLog", callLogSchema);
