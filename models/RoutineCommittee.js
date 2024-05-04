// models/RoutineCommittee.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoutineCommitteeSchema = new Schema({
    receiver: { type: String, ref: 'User', required: true },
    // Add other necessary fields
});

module.exports = mongoose.model('RoutineCommittee', RoutineCommitteeSchema);