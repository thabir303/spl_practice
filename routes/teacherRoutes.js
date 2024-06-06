const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
// const { isProgramChair } = require('./authRoutes');

const isProgramChair = (req, res, next) => {
    // Check if the program chair is logged in
    if (req.session.isProgramChairLoggedIn) {
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized (pC)" });
    }
  };

// Create a new teacher
router.post('/create', isProgramChair, async (req, res) => {
  try {
    const { teacherName, departmentName, teachersId, assignedCourseNames } = req.body;

    // Check if teachersId already exists
    if (await Teacher.findOne({ teachersId })) {
      return res.status(400).json({ error: 'Teacher ID already exists' });
    }

    const newTeacher = new Teacher({
      teacherName,
      departmentName,
      teachersId,
      assignedCourseNames,
    });

    const savedTeacher = await newTeacher.save();
    res.status(201).json({ message: 'Teacher created successfully', data: savedTeacher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

// Fetch all teachers
router.get('/get', isProgramChair, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({ data: teachers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Fetch a single teacher by ID
router.get('/get/:teachersId', isProgramChair, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teachersId: req.params.teachersId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json({ data: teacher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Update a teacher by ID
router.put('/edit/:teachersId', isProgramChair, async (req, res) => {
  try {
    const { teacherName, departmentName, assignedCourseNames } = req.body;
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teachersId: req.params.teachersId },
      { teacherName, departmentName, assignedCourseNames },
      { new: true }
    );
    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json({ message: 'Teacher updated successfully', data: updatedTeacher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// Delete a teacher by ID
router.delete('/delete/:teachersId', isProgramChair, async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findOneAndDelete({ teachersId: req.params.teachersId });
    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

module.exports = router;