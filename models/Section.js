//models/Section.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  sectionName: { type: String, required: true },
  // Add other section-related fields if needed
});

const Section = mongoose.model('Section', sectionSchema);
module.exports = Section;