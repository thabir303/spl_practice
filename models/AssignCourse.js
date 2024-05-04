// models/AssignCourse.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignCourseSchema = new Schema({
  semesterName: { type: String, ref: 'Semester', required: true },
  courseNames: [{ type: String, ref: 'Course', required: true }],
  teacherName: { type: String, ref: 'Teacher', required: true },
  batchNo: { type: String, ref: 'Batch', required: true },
});

const AssignCourse = mongoose.model('AssignCourse', assignCourseSchema);
module.exports = AssignCourse;