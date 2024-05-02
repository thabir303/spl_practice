//models/TimeSlot.js
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  timeSlotNo: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  shiftNo: { type: String, required: true },
});

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

TimeSlot.find = async () => {
  return await TimeSlot.find();
};

module.exports = TimeSlot;