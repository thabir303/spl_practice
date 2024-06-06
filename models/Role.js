// models/Role.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [String], // Array of permissions associated with the role
});

const Role = mongoose.model('Role', roleSchema);

// Define the roles and permissions
const ROLES = {
  student: { name: 'student', permissions: ['viewRoutine'] },
  teacher: { name: 'teacher', permissions: ['viewRoutine'] },
  coordinator: { name: 'coordinator', permissions: ['viewRoutine', 'createRoutine', 'updateRoutine', 'deleteRoutine'] },
  admin: { name: 'admin', permissions: ['viewRoutine', 'createRoutine', 'updateRoutine', 'deleteRoutine'] },
};

module.exports = { Role, ROLES };