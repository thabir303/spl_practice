const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');

// // Middleware to check if the user is the program chair
// const isProgramChair = (req, res, next) => {
//   if (req.session.isProgramChairLoggedIn) {
//     next();
//   } else {
//     return res.status(401).json({ error: "Unauthorized (pC)" });
//   }
// };


// Fetch all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Fetch a single teacher by ID
router.get('/:teacherId', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.params.teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json({ data: teacher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Update a teacher by ID
router.put('/edit/:teacherId', async (req, res) => {
  try {
    const { teacherName, departmentName, assignedCourseNames } = req.body;
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherId: req.params.teacherId },
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
router.delete('/delete/:teacherId', async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findOneAndDelete({ teacherId: req.params.teacherId });
    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

module.exports = router;








// // Create a new teacher
// router.post('/create', async (req, res) => {
//   try {
//     const { teacherName, departmentName, teacherId, assignedCourseNames = [] } = req.body;

//     // Check if teacherId already exists
//     if (await Teacher.findOne({ teacherId })) {
//       return res.status(400).json({ error: 'Teacher ID already exists' });
//     }

//     const newTeacher = new Teacher({
//       teacherName,
//       departmentName,
//       teacherId,
//       assignedCourseNames,
//     });

//     const savedTeacher = await newTeacher.save();
//     res.status(201).json({ message: 'Teacher created successfully', data: savedTeacher });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create teacher' });
//   }
// });
