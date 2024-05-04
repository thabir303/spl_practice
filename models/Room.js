// models/Room.js (Mongoose model for rooms)
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  building: { type: String, required: true },
  roomNo: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  roomType: { type: String, required: true },
  // Add other fields as needed
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;