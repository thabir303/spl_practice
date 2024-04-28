// models/Room.js (Mongoose model for rooms)
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  building: { type: String, required: true },
  room_no: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  room_type: { type: String, required: true },
  // Add other fields as needed
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;