//models/Teacher.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  name: { type: String, required: true },
  departmentName: String,
  rank: String,
  userName: String,
  teachersOffday: [String],
  assignedCourseNames: [String],
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;