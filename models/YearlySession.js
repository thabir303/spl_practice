const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yearlySessionSchema = new Schema({
  sessionName: { type: String, required: true },
});

const YearlySession = mongoose.model('YearlySession', yearlySessionSchema);
module.exports = YearlySession;