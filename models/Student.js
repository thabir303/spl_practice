// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  studentName: { type: String, required: true },
  batchNo: { type: String, required: true },
  sectionStudentIds: [String],
  semesterName: { type: String, required: true }, // Use semesterName instead of yearlySessionId
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;