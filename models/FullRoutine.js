const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FullRoutineSchema = new Schema({
  section: { type: String, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  courseId: { type: String, required: true },
  teacherId: { type: String, required: true },
  roomNo: { type: String, required: true },
  semesterName: { type: String, required: true },
  batchNo: { type: String, required: true }, // Added batchNo
  classType: { type: String, required: true, enum: ['Lab', 'Theory'] }
});

FullRoutineSchema.index({ batchNo: 1 });


module.exports = mongoose.model('FullRoutine', FullRoutineSchema);
