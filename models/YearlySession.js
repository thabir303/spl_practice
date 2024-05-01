// models/YearlySession.js
const mongoose = require('mongoose');

const yearlySessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sessionName: { type: String, ref: 'Session', required: true },
  isActive: { type: Boolean, default: true }
});

const YearlySession = mongoose.model('YearlySession', yearlySessionSchema);
module.exports = YearlySession;