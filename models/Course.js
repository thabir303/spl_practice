// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  credit: { type: Number, required: true },
  type: { type: String, enum: ["Theory", "Lab"], required: true },
  isActive: { type: Boolean, default: true },
});
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
