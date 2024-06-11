//models/Day.js
const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
    dayNo: {
      type: String,
      required: true,
      unique: true, // Add this line to make the field case-insensitive
    },
  });

const Day = mongoose.model('Day', daySchema);


module.exports = Day;