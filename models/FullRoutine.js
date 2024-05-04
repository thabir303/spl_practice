// models/FullRoutine.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FullRoutineSchema = new Schema({
  batchNo: { type: String, ref: 'Batch', required: true },
  sectionName: { type: String, ref: 'Section', required: true },
  dayNo: { type: String, ref: 'Day', required: true },
  teacherName: { type: String, ref: 'Teacher', required: true },
  courseName: { type: String, ref: 'Course', required: true },
  roomNo: { type: String, ref: 'Room', required: true },
  semesterName: { type: String, ref: 'Semester', required: true },
  timeSlotNo: { type: String, ref: 'TimeSlot', required: true },
});

module.exports = mongoose.model('FullRoutine', FullRoutineSchema);