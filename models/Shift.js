// // models/Shift.js
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const shiftSchema = new Schema({
//   shiftCode: { type: String, required: true, unique: true },
//   shiftName: { type: String, required: true },
//   isActive: { type: Boolean, default: true },
//   batches: [{ type: String, ref: 'Batch' }],
//   sessions: [{ type: String, ref: 'Session' }],
// }, { timestamps: true });

// const Shift = mongoose.model('Shift', shiftSchema);
// module.exports = Shift;