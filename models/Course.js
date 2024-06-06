// models/Course.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  courseId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  credit: { type: Number, required: true },
  type: { type: String, enum: ["Theory", "Lab"], required: true },
  semesterName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  // New fields for course assignments
  assignments: [{
    teacherId: { type: String, ref: 'Teacher', required: true },
    teacherName: { type: String, required: true },
    semesterName: { type: String, required: true }, // Use semesterName instead of batchNo
    isActive: { type: Boolean, default: true }
  }]
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
