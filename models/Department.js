// models/Department.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;