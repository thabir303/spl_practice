const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  assignedCourseNames: [String],
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;