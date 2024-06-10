// models/Room.js (Modified Mongoose model for rooms)
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  building: {
    type: String,
    // required: true,
    default: 'IIT', // Fixed building to 'IIT'
  },
  roomNo: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  roomType: {
    type: String,
    // required: true,
    enum: ['Theory', 'Lab'], // Room type can only be 'Theory' or 'Lab'
  },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;