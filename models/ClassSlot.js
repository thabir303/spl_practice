// models/ClassSlot.js
const mongoose = require('mongoose');

const classSlotSchema = new mongoose.Schema({
  batchNo: { type: String, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  courseId: { type: String, required: true },
  teacherId: { type: String, required: true },
}, {
  timestamps: true,
  unique: true, // Add this line to make the combination of fields unique
});

const ClassSlot = mongoose.model('ClassSlot', classSlotSchema);



ClassSlot.findAll = async () => {
    return await ClassSlot.find().populate('batchNo');
};

ClassSlot.create = async (data) => {
  const newClassSlot = new ClassSlot(data);
  return await newClassSlot.save();
};

ClassSlot.findByBatchNo = async (batchNo) => {
  return await ClassSlot.findOne({ batchNo }).populate('batchNo');
};

ClassSlot.updateByBatchNo = async (batchNo, data) => {
  return await ClassSlot.findOneAndUpdate({ batchNo }, data, { new: true }).populate('batchNo');
};

ClassSlot.deleteByBatchNo = async (batchNo) => {
  const result = await ClassSlot.deleteOne({ batchNo });
  return result.deletedCount === 1;
};

module.exports = ClassSlot;