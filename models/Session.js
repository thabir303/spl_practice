// models/Session.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  name: { type: String, required: true },
  shiftIds: [String],
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;