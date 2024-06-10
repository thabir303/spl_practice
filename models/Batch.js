// models/Batch.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const batchSchema = new mongoose.Schema(
  {
    batchNo: { type: String, required: true, unique: true },
    departmentCode: { type: String,  default: "IIT" },
    coordinatorId: { type: String, required: true },
    coordinatorEmail: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch; 
