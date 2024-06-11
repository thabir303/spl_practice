// models/Teacher.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  teacherId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  teacherName: { type: String },
  departmentName: { type: String, default: "IIT" },
  assignedCourses: { type: [String]},
  password:{type: String },
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
