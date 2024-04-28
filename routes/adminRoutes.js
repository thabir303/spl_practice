// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Batch = require('../models/Batch');
const Course = require('../models/Course');

// Route to fetch admin dashboard data
router.get('/', async (req, res) => {
  try {
    const teacher = await Teacher.countDocuments();
    const student = await Student.countDocuments({}, { sum: 1, number_of_student: 1 });
    const batch = await Batch.countDocuments();
    const course = await Course.countDocuments();
    const teachers = await Teacher.find().populate('department', 'rank', 'user');
    const rooms = await Room.find().sort({ id: -1 });
    const courses = await Course.find().sort({ id: -1 });

    res.json({ teacher, student, batch, course, teachers, rooms, courses });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add more routes for other admin functionality as needed

module.exports = router;