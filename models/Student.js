// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: { type: String, required: true },
  batchNo: { type: String, required: true },
  sectionStudentIds: [String],
  yearlySessionId: { type: String, required: true },
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;