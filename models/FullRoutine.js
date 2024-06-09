const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FullRoutineSchema = new Schema({
  batchNo: { type: String, required: true },
  sectionName: { type: String,  required: true },
  dayNo: { type: String, required: true },
  teacherName: { type: String, required: true },
  teacherId: { type: String },
  //courseId: { type: String, required: true },
  roomNo: { type: String, required: true },
  courseName: { type: String, required: true },
  semesterName: { type: String,  required: true },
  timeSlotNo: { type: String,  required: true },
});

module.exports = mongoose.model('FullRoutine', FullRoutineSchema);
