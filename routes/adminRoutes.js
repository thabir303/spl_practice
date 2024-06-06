// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { authenticateUser, authorizeRole } = require('../utils/auth');

// Middleware to ensure the user is the program chair
const isProgramChair = (req, res, next) => {
  if (req.session.isProgramChairLoggedIn) {
    req.user = { role: 'admin' };
    next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Route to get all pending users
router.get('/pending-users', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// Route to approve a user
router.post('/approve-user', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const { email, batchNo, teacherId } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status === 'approved') {
      return res.status(400).json({ error: 'User already approved' });
    }
    user.status = 'approved';
    await user.save();

    // Save user data to the respective schema
    if (user.role === 'teacher') {
      if (!teacherId) {
        return res.status(400).json({ error: 'teacherId is required for teacher approval' });
      }

      const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email: user.email }] });
      if (existingTeacher) {
        return res.status(400).json({ error: 'Teacher ID or email already exists' });
      }

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
      if (!batchNo) {
        return res.status(400).json({ error: 'batchNo is required for student approval' });
      }

      const existingStudent = await Student.findOne({ $or: [{ studentId: user.userId }, { email: user.email }] });
      if (existingStudent) {
        return res.status(400).json({ error: 'Student ID or email already exists' });
      }

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
router.get('/users', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
