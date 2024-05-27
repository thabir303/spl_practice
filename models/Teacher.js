//models/Teacher.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  teacherName: { type: String, required: true },
  departmentName: { type: String,ref: "Batch", required: true, default: "IIT" },
  rank: String,
  teachersOffday: [String],
  assignedCourseNames: [String],
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;