// models/ClassSlot.js
const mongoose = require('mongoose');

const classSlotSchema = new mongoose.Schema(
  {
    semesterName: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    courseId: { type: String, required: true },
    teacherId: { type: String, required: true },
    roomNo: { type: String, required: true },
    section: { type: String, required: true },
    classType: { type: String, required: true, enum: ['Lab', 'Theory'] }
  },
  {
    timestamps: true
  }
);

const ClassSlot = mongoose.model('ClassSlot', classSlotSchema);
module.exports = ClassSlot;


// ClassSlot.find = async () => {
//   return await ClassSlot.find();
// };

// ClassSlot.create = async (data) => {
//   const newClassSlot = new ClassSlot(data);
//   return await newClassSlot.save();
// };

// ClassSlot.findByBatchNo = async (batchNo) => {
//   return await ClassSlot.findOne({ batchNo });
// };

// ClassSlot.updateByBatchNo = async (batchNo, data) => {
//   return await ClassSlot.findOneAndUpdate({ batchNo }, data, { new: true });
// };

// ClassSlot.deleteByBatchNo = async (batchNo) => {
//   const result = await ClassSlot.deleteOne({ batchNo });
//   return result.deletedCount === 1;
// };

