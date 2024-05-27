//models/RoutineCommittee.js
const mongoose = require('mongoose');

const routineCommitteeSchema = new mongoose.Schema({
  coordinatorId: {
    type: String,
    required: true,
    unique: true,
  },
  expired_date: {
    type: Date,
    required: true,
  },
  in_committee: {
    type: Boolean,
    default: false,
  },
  request_status: {
    type: String,
    default: 'active',
  },
}, {
  timestamps: true,
});

const RoutineCommittee = mongoose.model('RoutineCommittee', routineCommitteeSchema);

module.exports = RoutineCommittee;