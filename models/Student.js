// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  studentId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  batchNo: { type: String ,required: true,},
  // sectionStudentIds: [String],
  // semesterName: { type: String, required: true }, // Use semesterName instead of yearlySessionId
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;