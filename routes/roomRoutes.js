const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { authenticateUser, authorizeRole } = require('../utils/auth');

// Middleware to ensure the user is the program chair
const isProgramChair = (req, res, next) => {
  if (req.session.isProgramChairLoggedIn) {
    req.user = { role: "admin" };
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Route to create a new room
router.post('/', async (req, res) => {
  try {
    const { roomNo, roomType, isActive } = req.body;

    // Validate input data
    if (!roomNo || !roomType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the room already exists
    const existingRoom = await Room.findOne({ roomNo });
    if (existingRoom) {
      return res.status(400).json({ error: 'Room with this number already exists' });
    }

    // Create a new room
    const newRoom = new Room({
      roomNo,
      roomType,
      isActive,
      building: 'IIT', // Fixed building to 'IIT'
    });

    const savedRoom = await newRoom.save();
    res.json({ message: 'Room created successfully', data: savedRoom });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Route to get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Route to get a specific room by roomNo
router.get('/:roomNo', async (req, res) => {
  try {
    const { roomNo } = req.params;
    const room = await Room.findOne({ roomNo });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Route to update a room
router.put('/:roomNo', isProgramChair, async (req, res) => {
  try {
    const { roomNo } = req.params;
    const { roomType, isActive } = req.body;

    // Validate input data
    if (!roomType && isActive === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const room = await Room.findOne({ roomNo });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Update the room fields
    if (roomType) room.roomType = roomType;
    if (isActive !== undefined) room.isActive = isActive;

    const updatedRoom = await room.save();
    res.json({ message: 'Room updated successfully', data: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Route to delete a room
router.delete('/:roomNo', isProgramChair, async (req, res) => {
  try {
    const { roomNo } = req.params;

    const room = await Room.findOne({ roomNo });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await Room.findOneAndDelete({ roomNo });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
