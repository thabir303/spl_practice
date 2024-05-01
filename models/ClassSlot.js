// models/ClassSlot.js
const mongoose = require('mongoose');

const classSlotSchema = new mongoose.Schema(
  {
    batchNo: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    courseId: { type: String, required: true },
    teacherId: { type: String, required: true },
    roomNo: { type: String, required: true },
  },
  {
    timestamps: true,
    unique: true, // Make the combination of fields unique
  }
);

const ClassSlot = mongoose.model('ClassSlot', classSlotSchema);

ClassSlot.find = async () => {
  return await ClassSlot.find();
};

ClassSlot.create = async (data) => {
  const newClassSlot = new ClassSlot(data);
  return await newClassSlot.save();
};

ClassSlot.findByBatchNo = async (batchNo) => {
  return await ClassSlot.findOne({ batchNo });
};

ClassSlot.updateByBatchNo = async (batchNo, data) => {
  return await ClassSlot.findOneAndUpdate({ batchNo }, data, { new: true });
};

ClassSlot.deleteByBatchNo = async (batchNo) => {
  const result = await ClassSlot.deleteOne({ batchNo });
  return result.deletedCount === 1;
};

module.exports = ClassSlot;