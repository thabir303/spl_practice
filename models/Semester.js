// models/Semester.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const semesterSchema = new Schema({
  semesterName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
});

const Semester = mongoose.model('Semester', semesterSchema);
module.exports = Semester;