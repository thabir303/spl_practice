// models/Batch.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const batchSchema = new Schema({
  batchNo: { type: String, required: true, unique: true },
  departmentCode: { type: String, ref: 'Department', required: true },
  shiftCode: { type: String, ref: 'Shift', required: true },
  students: [{ type: String, ref: 'Student' }],
}, { timestamps: true });

const Batch = mongoose.model('Batch', batchSchema);
module.exports = Batch;












// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const batchSchema = new Schema({
//   name: { type: String, required: true },
//   departmentName: { type: String, required: true },
//   shiftName: { type: String, required: true },
//   studentNames: [String],
// });

// const Batch = mongoose.model('Batch', batchSchema);
// module.exports = Batch;