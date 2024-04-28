const express = require('express');
const router = express.Router();
const AssignCourse = require('../models/AssignCourse');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const YearlySession = require('../models/YearlySession');

// Route to fetch assigned courses
router.get('/', async (req, res) => {
  try {
    const assignCourses = await AssignCourse.find().exec();
    const populatedAssignCourses = await Promise.all(
      assignCourses.map(async (assignCourse) => {
        const courseNames = await Course.find({ _id: { $in: assignCourse.courseIds } }).then((courses) =>
          courses.map((course) => course.name)
        );
        return { ...assignCourse._doc, courseNames };
      })
    );
    res.json(populatedAssignCourses);
  } catch (error) {
    console.error('Error fetching assigned courses:', error);
    res.status(500).json({ error: 'Failed to fetch assigned courses' });
  }
});

// Route to create a new assigned course
router.post('/', async (req, res) => {
  try {
    const { sessionName, courseNames, teacherName, batchName } = req.body;

    // Validate input data
    if (!sessionName || !Array.isArray(courseNames) || courseNames.length === 0 || !teacherName || !batchName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if any assignment already exists for the provided teacher, session, and courses
    const existingAssignment = await AssignCourse.findOne({
      sessionName,
      teacherName,
      courseNames: { $in: courseNames },
      batchName,
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Data already assigned' });
    }

    // If no existing assignment, create a new one
    const newAssignment = new AssignCourse({
      sessionName,
      courseNames,
      teacherName,
      batchName,
    });

    const savedAssignment = await newAssignment.save();
    res.json({ message: 'Successfully created', data: savedAssignment });
  } catch (error) {
    console.error('Error creating assigned course:', error);
    res.status(500).json({ error: 'Failed to create assigned course' });
  }
});

// Route to fetch data for creating a new assigned course
router.get('/create', async (req, res) => {
  try {
    const batches = await Batch.find().exec();
    const teachers = await Teacher.find().exec();
    const courses = await Course.find({ isActive: true }).exec();
    const sessions = await YearlySession.find({ isActive: true }).exec();

    res.json({ batches, teachers, courses, sessions });
  } catch (error) {
    console.error('Error fetching data for create form:', error);
    res.status(500).json({ error: 'Failed to fetch data for create form' });
  }
});
// Route to edit an assigned course
router.get('/edit/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const assignCourse = await AssignCourse.findOne({ courseNames: courseId }).exec();

    if (!assignCourse) {
      return res.status(404).json({ error: 'Assign course not found' });
    }

    const teacher = await Teacher.findOne({ name: assignCourse.teacherName }).exec();
    const session = await YearlySession.findOne({ sessionName: assignCourse.sessionName }).exec();
    const courses = await Course.find({ isActive: true }).exec();
    const sessions = await YearlySession.find({ isActive: true }).exec();

    res.json({ assignCourse, teacher, session, courses, sessions });
  } catch (error) {
    console.error('Error fetching data for edit form:', error);
    res.status(500).json({ error: 'Failed to fetch data for edit form' });
  }
});

// Route to update an assigned course
router.put('/:courseId', async (req, res) => {
  try {
    const { sessionName, courseNames, teacherName } = req.body;
    const courseId = req.params.courseId;

    // Find the existing AssignCourse document by its courseNames
    const existingAssignCourse = await AssignCourse.findOne({ courseNames: courseId });

    if (!existingAssignCourse) {
      return res.status(404).json({ error: 'Assign course not found' });
    }

    // Check if any assignment already exists for the provided teacher, session, and courses
    const existingAssignment = await AssignCourse.findOne({
      sessionName,
      teacherName,
      courseNames: { $in: courseNames },
      batchName: existingAssignCourse.batchName,
      _id: { $ne: existingAssignCourse._id },
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Data already assigned' });
    }

    // Update the existing AssignCourse document
    const updatedAssignCourse = await AssignCourse.findByIdAndUpdate(
      existingAssignCourse._id,
      { sessionName, courseNames, teacherName },
      { new: true }
    );

    res.json(updatedAssignCourse);
  } catch (error) {
    console.error('Error updating assigned course:', error);
    res.status(500).json({ error: 'Failed to update assigned course' });
  }
});

// Route to delete an assigned course
router.delete('/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Find the AssignCourse document by the courseNames field
    const assignCourse = await AssignCourse.findOne({ courseNames: courseId });

    if (!assignCourse) {
      return res.status(404).json({ error: 'Assign course not found' });
    }

    // Delete the found AssignCourse document
    await AssignCourse.findByIdAndDelete(assignCourse._id);

    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting assigned course:', error);
    res.status(500).json({ error: 'Failed to delete assigned course' });
  }
});
module.exports = router;