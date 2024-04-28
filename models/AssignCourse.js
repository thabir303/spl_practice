const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignCourseSchema = new Schema({
  sessionName: { type: String, required: true },
  courseNames: [{ type: String, required: true }],
  teacherName: { type: String, required: true },
  batchName: { type: String, required: true },
});

const AssignCourse = mongoose.model('AssignCourse', assignCourseSchema);
module.exports = AssignCourse;