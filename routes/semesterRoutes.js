const express = require('express');
const router = express.Router();
const Semester = require('../models/Semester');

// Route to get all semester names
router.get('/', async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
});

// Route to create a new semester
router.post('/', async (req, res) => {
  try {
    const { semesterName } = req.body;

    // Check if the semester name already exists
    const existingSemester = await Semester.findOne({ semesterName });
    if (existingSemester) {
      return res.status(400).json({ error: 'Semester name already exists' });
    }

    // Create a new semester
    const newSemester = new Semester({ semesterName });
    const savedSemester = await newSemester.save();
    res.json(savedSemester);
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({ error: 'Failed to create semester' });
  }
});

// // Route to update a semester
// router.put('/:semesterName', async (req, res) => {
//   try {
//     const { newSemesterName, isActive } = req.body;
//     const currentSemesterName = req.params.semesterName;

//     // Check if the semester exists
//     const existingSemester = await Semester.findOne({ semesterName: currentSemesterName });
//     if (!existingSemester) {
//       return res.status(404).json({ error: 'Semester not found' });
//     }

//     // Check if the new semester name already exists
//     const semesterWithNewName = await Semester.findOne({ semesterName: newSemesterName });
//     if (semesterWithNewName) {
//       return res.status(400).json({ error: 'Semester name already exists' });
//     }

//     // Update the semester
//     existingSemester.semesterName = newSemesterName;
//     existingSemester.isActive = isActive;
//     const updatedSemester = await existingSemester.save();
//     res.json(updatedSemester);
//   } catch (error) {
//     console.error('Error updating semester:', error);
//     res.status(500).json({ error: 'Failed to update semester' });
//   }
// });

// // Route to delete a semester
// router.delete('/:semesterName', async (req, res) => {
//   try {
//     const semesterName = req.params.semesterName;

//     // Check if the semester exists
//     const existingSemester = await Semester.findOne({ semesterName });
//     if (!existingSemester) {
//       return res.status(404).json({ error: 'Semester not found' });
//     }

//     // Delete the semester
//     await existingSemester.remove();
//     res.json({ message: 'Semester deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting semester:', error);
//     res.status(500).json({ error: 'Failed to delete semester' });
//   }
// });

module.exports = router;