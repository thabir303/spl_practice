const mongoose = require("mongoose");

const coordinatorSchema = new mongoose.Schema({
  coordinatorId: { type: String, required: true, unique: true },
  coordinatorName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  expired_date: {type: Date,required: true,},
  batchNo: { type: String, required: true },
}, {
  timestamps: true
});

const Coordinator = mongoose.model("Coordinator", coordinatorSchema);

module.exports = Coordinator;