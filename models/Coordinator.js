const mongoose = require("mongoose");

const coordinatorSchema = new mongoose.Schema({
  coordinatorId: { type: String,  unique: true },
  coordinatorName: { type: String,  },
  email: { type: String,  },
  password: { type: String, },
  expired_date: {type: Date,},
  batchNo: { type: String,  },
}, {
  timestamps: true
});

const Coordinator = mongoose.model("Coordinator", coordinatorSchema);

module.exports = Coordinator;