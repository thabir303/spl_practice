// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Route to fetch all rooms
// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNo: -1 });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Route to fetch a room by roomNo
// GET /api/rooms/:roomNo
router.get('/:roomNo', async (req, res) => {
  try {
    const room = await Room.findOne({ roomNo: req.params.roomNo });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Route to create a new room
// POST /api/rooms
// Request Body: { roomNo, roomType, capacity }
router.post('/', async (req, res) => {
  try {
    const { roomNo, roomType, capacity } = req.body;

    // Validate input
    if (!roomNo || !roomType || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the room number already exists
    const existingRoom = await Room.findOne({ roomNo });
    if (existingRoom) {
      return res.status(400).json({ error: 'Room number already exists' });
    }

    // Create a new room
    const newRoom = new Room({ roomNo, roomType, capacity });
    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Route to update an existing room
// PUT /api/rooms/:roomNo
// Request Body: { roomNo, roomType, capacity, isActive }
router.put('/:roomNo', async (req, res) => {
  try {
    const { roomNo, roomType, capacity, isActive } = req.body;

    // Validate input
    if (!roomNo || !roomType || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the room number already exists for another room
    const existingRoom = await Room.findOne({ roomNo, roomNo: { $ne: req.params.roomNo } });
    if (existingRoom) {
      return res.status(400).json({ error: 'Room number already exists' });
    }

    // Update the room
    const updatedRoom = await Room.findOneAndUpdate(
      { roomNo: req.params.roomNo },
      { roomNo, roomType, capacity, isActive },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Route to delete a room
// DELETE /api/rooms/:roomNo
router.delete('/:roomNo', async (req, res) => {
  try {
    const deletedRoom = await Room.findOneAndDelete({ roomNo: req.params.roomNo });
    if (!deletedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;