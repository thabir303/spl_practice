//models/Day.js
const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
    dayNo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Add this line to make the field case-insensitive
    },
  });

const Day = mongoose.model('Day', daySchema);

Day.createDays = async (daysToCreate) => {
  try {
    const createdDays = await Day.insertMany(daysToCreate);
    return createdDays;
  } catch (error) {
    console.error('Error creating days:', error);
    throw error;
  }
};

module.exports = Day;