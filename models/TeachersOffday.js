// models/TeachersOffday.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeachersOffdaySchema = new Schema({
    teacher: { type: String, ref: 'Teacher', required: true },
    day: { type: String, ref: 'Day', required: true }
});

module.exports = mongoose.model('TeachersOffday', TeachersOffdaySchema);