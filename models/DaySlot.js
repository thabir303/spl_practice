//models/DaySlot.js
const mongoose = require('mongoose');

const daySlotSchema = new mongoose.Schema({
  dayNo: { type: String, required: true },
  timeSlotNo: { type: String, required: true },
  classSlot: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DaySlot = mongoose.model('DaySlot', daySlotSchema);

module.exports = DaySlot; 

// DaySlot.find = async () => {
//   return await DaySlot.find();
// };

// DaySlot.findByDayNo = async (dayNo) => {
//   return await DaySlot.find({ dayNo });
// };

// DaySlot.deleteByDayNo = async (dayNo) => {
//   const result = await DaySlot.deleteMany({ dayNo });
//   return result.deletedCount > 0;
// };

// DaySlot.insertMany = async (data) => {
//   return await DaySlot.insertMany(data);
// };
