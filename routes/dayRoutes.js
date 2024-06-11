//routes/dayRoutes.js
const express = require('express');
const router = express.Router();
const Day = require('../models/Day');
const DaySlot = require('../models/DaySlot');
const TimeSlot = require('../models/TimeSlot');

// Route to get all days
router.get('/', async (req, res) => {
  try {
    const days = await Day.find();
    res.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    res.status(500).json({ error: 'Failed to fetch days' });
  }
});
// Route to create a new day
router.post('/', async (req, res) => {
  try {
    const { dayNo } = req.body;

    if (!dayNo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingDay = await Day.findOne({ dayNo });
    if (existingDay) {
      return res.status(400).json({ error: 'Day with this number already exists' });
    }

    const newDay = new Day({
      dayNo,
      
    });

    const savedDay = await newDay.save();
    res.json({ message: 'Day created successfully', data: savedDay });
  } catch (error) {
    console.error('Error creating day:', error);
    res.status(500).json({ error: 'Failed to create day' });
  }
});

// Route to get a specific day by ID
router.get('/:id', async (req, res) => {
  try {
    const day = await Day.findOne({ dayNo: req.params.id });
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }
    res.json(day);
  } catch (error) {
    console.error('Error fetching day:', error);
    res.status(500).json({ error: 'Failed to fetch day' });
  }
});

// Route to get all day-wise slots
router.get('/:dayNo/slots', async (req, res) => {
  try {
    const daySlots = await DaySlot.find({ dayNo: req.params.dayNo });
    res.json(daySlots);
  } catch (error) {
    console.error('Error fetching day-wise slots:', error);
    res.status(500).json({ error: 'Failed to fetch day-wise slots' });
  }
});

// Route to create a day-wise slot
router.post('/:dayNo/slots', async (req, res) => {
  try {
    const dayNo = req.params.dayNo;
    const { timeSlotNo, classSlot } = req.body;

    if (!timeSlotNo || !classSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const day = await Day.findOne({ dayNo });
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    const newDaySlot = new DaySlot({
      dayNo,
      timeSlotNo,
      classSlot,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedDaySlot = await newDaySlot.save();
    res.json({ message: 'Day-wise slot created successfully', data: savedDaySlot });
  } catch (error) {
    console.error('Error creating day-wise slot:', error);
    res.status(500).json({ error: 'Failed to create day-wise slot' });
  }
});

// Route to delete all day-wise slots for a specific day
router.delete('/:dayNo/slots', async (req, res) => {
  try {
    const dayNo = req.params.dayNo;
    const deletedSlots = await DaySlot.deleteMany({ dayNo });
    res.json({ message: 'Day-wise slots deleted successfully', data: deletedSlots });
  } catch (error) {
    console.error('Error deleting day-wise slots:', error);
    res.status(500).json({ error: 'Failed to delete day-wise slots' });
  }
});

module.exports = router;
