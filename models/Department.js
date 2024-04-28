// models/Department.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  departmentCode: { type: String, required: true, unique: true },
  // Other department fields
});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;