//routes/assignCourseRoutes.js
const express = require("express");
const router = express.Router();
const AssignCourse = require("../models/AssignCourse");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const Semester = require("../models/Semester");

// Route to fetch assigned courses
router.get("/", async (req, res) => {
  try {
    const assignCourses = await AssignCourse.find().exec();
    res.json(assignCourses);
  } catch (error) {
    console.error("Error fetching assigned courses:", error);
    res.status(500).json({ error: "Failed to fetch assigned courses" });
  }
});

// Route to create a new assigned course
router.post("/", async (req, res) => {
  try {
    const { semesterName, courseNames, teacherName, batchNo } = req.body;

    // Validate input data
    if (
      !semesterName ||
      !Array.isArray(courseNames) ||
      courseNames.length === 0 ||
      !teacherName ||
      !batchNo
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the batch exists
    const batch = await Batch.findOne({ batchNo });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Check if any assignment already exists for the provided teacher, semester, and courses
    const existingAssignment = await AssignCourse.findOne({
      semesterName,
      teacherName,
      courseNames: { $in: courseNames },
      batchNo,
    });

    if (existingAssignment) {
      return res.status(400).json({ error: "Data already assigned" });
    }

    // If no existing assignment, create a new one
    const newAssignment = new AssignCourse({
      semesterName,
      courseNames,
      teacherName,
      batchNo,
    });

    const savedAssignment = await newAssignment.save();
    res.json({ message: "Successfully created", data: savedAssignment });
  } catch (error) {
    console.error("Error creating assigned course:", error);
    res.status(500).json({ error: "Failed to create assigned course" });
  }
});

// Route to fetch data for creating a new assigned course
router.get("/create", async (req, res) => {
  try {
    const batches = await Batch.find().exec();
    const teachers = await Teacher.find().exec();
    const courses = await Course.find({ isActive: true }).exec();
    const semesters = await Semester.find({ isActive: true }).exec();

    res.json({ batches, teachers, courses, semesters });
  } catch (error) {
    console.error("Error fetching data for create form:", error);
    res.status(500).json({ error: "Failed to fetch data for create form" });
  }
});

// Route to edit an assigned course
router.get('/edit/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const assignCourse = await AssignCourse.findOne({
      courseNames: courseId,
    }).exec();

    if (!assignCourse) {
      return res.status(404).json({ error: 'Assign course not found' });
    }

    // Find the semester data
    const semesterData = await Semester.findOne({ semesterName: assignCourse.semesterName }).exec();
    if (!semesterData) {
      return res.status(404).json({ error: 'Semester not found' });
    }

    // Find the teacher data
    const teacherData = await Teacher.findOne({ teacherName: assignCourse.teacherName }).exec();
    if (!teacherData) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Find the batch data
    const batchData = await Batch.findOne({ batchNo: assignCourse.batchNo }).exec();
    if (!batchData) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Find the course data
    const courseData = await Promise.all(assignCourse.courseNames.map(async (courseName) => {
      const course = await Course.findOne({ courseName }).exec();
      if (!course) {
        return null; // or handle the case where the course is not found
      }
      return course;
    }));

    // Find all active semesters
    const semesters = await Semester.find({ isActive: true }).exec();

    res.json({
      assignCourse,
      semester: semesterData,
      teacher: teacherData,
      batch: batchData,
      courses: courseData.filter(Boolean), // Filter out null values
      semesters,
    });
  } catch (error) {
    console.error('Error fetching data for edit form:', error);
    res.status(500).json({ error: 'Failed to fetch data for edit form' });
  }
});
// Route to update an assigned course
router.put("/edit/:courseId", async (req, res) => {
  try {
    const { semesterName, courseNames, teacherName } = req.body;
    const courseId = req.params.courseId;

    // Find the existing AssignCourse document by its courseNames
    const existingAssignCourse = await AssignCourse.findOne({
      courseNames: courseId,
    });

    if (!existingAssignCourse) {
      return res.status(404).json({ error: "Assign course not found" });
    }

    // Check if any assignment already exists for the provided teacher, semester, and courses
    const existingAssignment = await AssignCourse.findOne({
      semesterName,
      teacherName,
      courseNames: { $in: courseNames },
      batchNo: existingAssignCourse.batchNo,
      _id: { $ne: existingAssignCourse._id },
    });

    if (existingAssignment) {
      return res.status(400).json({ error: "Data already assigned" });
    }

    // Update the existing AssignCourse document
    const updatedAssignCourse = await AssignCourse.findByIdAndUpdate(
      existingAssignCourse._id,
      { semesterName, courseNames, teacherName },
      { new: true }
    );
    // req.flash('success', 'Course updated successfully');
    res.json({ message: 'Course updated successfully', data: updatedAssignCourse });
    // res.json(updatedAssignCourse);
  } catch (error) {
    console.error("Error updating assigned course:", error);
    res.status(500).json({ error: "Failed to update assigned course" });
  }
});

// Route to delete an assigned course
router.delete("/delete/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Find the AssignCourse document by the courseNames field
    const assignCourse = await AssignCourse.findOne({ courseNames: courseId });

    if (!assignCourse) {
      return res.status(404).json({ error: "Assign course not found" });
    }

    // Delete the found AssignCourse document
    await AssignCourse.findByIdAndDelete(assignCourse._id);

    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting assigned course:", error);
    res.status(500).json({ error: "Failed to delete assigned course" });
  }
});
module.exports = router;