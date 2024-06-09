// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Route to get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// Route to approve a user
router.post('/approve-user', async (req, res) => {
  try {
    const { email, batchNo, teacherId } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status === 'approved') {
      return res.status(400).json({ error: 'User already approved' });
    }

    // Check for the existence of batchNo for students
    if (user.role === 'student' && !batchNo) {
      return res.status(400).json({ error: 'Batch number is required for student approval' });
    }

    // Check for the existence of teacherId for teachers
    if (user.role === 'teacher' && !teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required for teacher approval' });
    }

    // Check if the teacherId already exists
    if (user.role === 'teacher') {
      const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email: user.email }] });
      if (existingTeacher) {
        return res.status(400).json({ error: 'Teacher ID or email already exists. Please provide a different Teacher ID.' });
      }
    }

    // Check if the batchNo already exists for students
    if (user.role === 'student') {
      const batchExists = await Batch.findOne({ batchNo }); // Assuming you have a Batch model to validate batch numbers
      if (!batchExists) {
        return res.status(400).json({ error: 'Batch number does not exist. Please create the batch first.' });
      }

      const existingStudent = await Student.findOne({ $or: [{ studentId: user.userId }, { email: user.email }] });
      if (existingStudent) {
        return res.status(400).json({ error: 'Student ID or email already exists. Please provide a different email or contact support.' });
      }
    }

    user.status = 'approved';
    await user.save();

    // Save user data to the respective schema
    if (user.role === 'teacher') {
      const newTeacher = new Teacher({
        teacherId,
        teacherName: user.name,
        email: user.email,
        departmentName: 'IIT', // Set default or retrieve from request body
        assignedCourses: [] // Initialize with an empty array
      });
      await newTeacher.save();
      console.log('Teacher created:', newTeacher);
    } else if (user.role === 'student') {
      const newStudent = new Student({
        studentId: user.userId,
        name: user.name,
        email: user.email,
        batchNo,
      });
      await newStudent.save();
      console.log('Student created:', newStudent);
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    console.log('User approved:', user);
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error during user approval:', error);
    res.status(500).json({ error: 'Failed to approve user', details: error.message });
  }
});


// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
