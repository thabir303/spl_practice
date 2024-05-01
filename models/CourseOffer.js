// models/CourseOffer.js
const mongoose = require('mongoose');

const courseOfferSchema = new mongoose.Schema({
    // yearlySessionName: { type: String, ref: 'YearlySession', required: true },
    courseNames: [{ type: String, ref: 'Course', required: true }], // Change this line
    batchNo: { type: String, ref: 'Batch', required: true }
  });

const CourseOffer = mongoose.model('CourseOffer', courseOfferSchema);
module.exports = CourseOffer;