// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
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

// Route to get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Route to get courses by semester
router.get('/semester/:semesterName', async (req, res) => {
  try {
    const { semesterName } = req.params;
    const courses = await Course.find({ semesterName });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by semester:', error);
    res.status(500).json({ error: 'Failed to fetch courses by semester' });
  }
});

// Route to create a new course
router.post('/', isProgramChair, async (req, res) => {
  try {
    const { courseId, courseName, credit, type, semesterName, isActive } = req.body;

    // Validate input data
    if (!courseId || !courseName || credit === undefined || !type || !semesterName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the course already exists
    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course with this ID already exists' });
    }

    // Create a new course
    const newCourse = new Course({ courseId, courseName, credit, type, semesterName, isActive });
    const savedCourse = await newCourse.save();
    res.json({ message: 'Course created successfully', data: savedCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Route to update a course
router.put('/:courseId', isProgramChair, async (req, res) => {
  try {
    const { courseName, credit, type, semesterName, isActive } = req.body;
    const courseId = req.params.courseId;

    // Validate input data
    if (!courseName || credit === undefined || !type || !semesterName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the course exists
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update the course
    course.courseName = courseName;
    course.credit = credit;
    course.type = type;
    course.semesterName = semesterName;
    course.isActive = isActive;

    const updatedCourse = await course.save();
    res.json({ message: 'Course updated successfully', data: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Route to delete a course
router.delete('/:courseId', isProgramChair, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check if the course exists
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await Course.findOneAndDelete({ courseId });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Route to unassign a course from a teacher
router.delete('/:courseId/unassign', isProgramChair, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { teacherId, semesterName } = req.body;

    if (!teacherId || !semesterName) {
      return res.status(400).json({ error: 'teacherId and semesterName are required' });
    }

    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const assignmentIndex = course.assignments.findIndex(a =>
      a.teacherId === teacherId && a.semesterName === semesterName
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    course.assignments.splice(assignmentIndex, 1);
    await course.save();

    // Update teacher's assignedCourses
    await Teacher.updateOne(
      { teacherId },
      { $pull: { assignedCourses: course.courseId } }
    );

    res.json({ message: 'Course unassigned successfully', data: course });
  } catch (error) {
    console.error('Error unassigning course:', error);
    res.status(500).json({ error: 'Failed to unassign course', details: error.message });
  }
});

// Route to get all assignments for a course
router.get('/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course.assignments);
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    res.status(500).json({ error: 'Failed to fetch course assignments' });
  }
});

// Route to get all courses assigned to a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const courses = await Course.find({ 'assignments.teacherId': teacherId });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ error: 'Failed to fetch teacher courses' });
  }
});

// Route to get all courses for a semester
router.get('/semester/:semesterName', async (req, res) => {
  try {
    const { semesterName } = req.params;
    const courses = await Course.find({ semesterName });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching semester courses:', error);
    res.status(500).json({ error: 'Failed to fetch semester courses' });
  }
});

// Route to create multiple courses for a teacher
router.post('/:teacherId', isProgramChair, async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if the teacher exists
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get the course data from the request body
    const coursesData = req.body.courses;

    // Validate the course data
    if (!coursesData || !Array.isArray(coursesData) || coursesData.length === 0) {
      return res.status(400).json({ error: 'Invalid course data' });
    }

    // Create courses and assign them to the teacher
    const createdCourses = [];
    for (const courseData of coursesData) {
      const { courseId, courseName, credit, type, semesterName, isActive } = courseData;

      // Validate course data
      if (!courseId || !courseName || credit === undefined || !type || !semesterName) {
        return res.status(400).json({ error: 'Missing required fields in course data' });
      }

      // Check if the course already exists
      const existingCourse = await Course.findOne({ courseId });
      if (existingCourse) {
        return res.status(400).json({ error: `Course with ID ${courseId} already exists` });
      }

      // Create a new course
      const newCourse = new Course({
        courseId,
        courseName,
        credit,
        type,
        semesterName, // Use semesterName instead of semester
        isActive,
        assignments: [
          {
            teacherId,
            teacherName: teacher.teacherName,
            semesterName, // Use semesterName instead of batchNo
            isActive: true,
          },
        ],
      });

      const savedCourse = await newCourse.save();
      createdCourses.push(savedCourse);
    }

    res.json({ message: 'Courses created successfully', data: createdCourses });
  } catch (error) {
    console.error('Error creating courses:', error);
    res.status(500).json({ error: 'Failed to create courses' });
  }
});

module.exports = router;

















/*
// Route to assign a course to a teacher
router.post('/:courseId/assign', isProgramChair, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { teacherId, semesterName, isActive } = req.body;

    // Validate input
    if (!teacherId || !semesterName) {
      return res.status(400).json({ error: 'teacherId and semesterName are required' });
    }

    // Check if course exists
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if teacher exists and get their name
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if this course is already assigned to this teacher for this semester
    const existingAssignment = course.assignments.find(a =>
      a.teacherId === teacherId && a.semesterName === semesterName
    );

    if (existingAssignment) {
      return res.status(400).json({ error: 'Course already assigned to this teacher for this semester' });
    }

    // Add the assignment
    course.assignments.push({
      teacherId,
      teacherName: teacher.teacherName,
      semesterName,
      isActive: isActive ?? true
    });

    await course.save();

    // Update teacher's assignedCourses (if you want to keep this for quick access)
    await Teacher.updateOne(
      { teacherId },
      { $addToSet: { assignedCourses: course.courseId } }
    );

    res.json({ message: 'Course assigned successfully', data: course });
  } catch (error) {
    console.error('Error assigning course:', error);
    res.status(500).json({ error: 'Failed to assign course', details: error.message });
  }
}); */
