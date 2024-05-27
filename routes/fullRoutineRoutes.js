//routes/fullRoutineRoutes.js
const express = require("express");
const router = express.Router();
const FullRoutine = require("../models/FullRoutine");
const Day = require("../models/Day");
const DayWiseSlot = require("../models/DaySlot");
const Batch = require("../models/Batch");
const Section = require("../models/Section");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const Room = require("../models/Room");
const TimeSlot = require("../models/TimeSlot");
const Semester = require("../models/Semester");
const User = require("../models/User");
const Coordinator = require("../models/Coordinator");
const { Role, ROLES } = require('../models/Role');
const {
  generateToken,
  authenticateUser,
  authorizeRole,
  PROGRAM_CHAIR_USER,
} = require("../utils/auth");


const isProgramChairOrCoordinator = (req, res, next) => {
  if (req.session.isProgramChairLoggedIn || req.session.isCoordinatorLoggedIn) {
    req.user = { role: req.session.isProgramChairLoggedIn ? "programChair" : "coordinator" };
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized from" });
  }
};

// Route to fetch full routines
// GET /fullRoutines/:semesterName
router.get('/:semesterName', authenticateUser, authorizeRole('student', 'faculty', 'coordinator', 'programChair'), async (req, res) => {
  try {
    const semesterName = req.params.semesterName;
    const fullRoutines = await FullRoutine.find({ semesterName }).exec();
    res.json(fullRoutines);
  } catch (error) {
    console.error('Error fetching full routines:', error);
    res.status(500).json({ error: 'Failed to fetch full routines' });
  }
});

// Route to create a new full routine
// POST /fullRoutines
// Request Body: { batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo }

// Route to create a new full routine
router.post('/',isProgramChairOrCoordinator , async (req, res) => {
  try {
    const { batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo } = req.body;

    // Validate input data
    if (!batchNo || !sectionName || !dayNo || !teacherName || !courseName || !roomNo || !semesterName || !timeSlotNo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch exists
    const batch = await Batch.findOne({ batchNo }).exec();
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if the section exists
    const section = await Section.findOne({ sectionName }).exec();
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Check if the day exists
    const day = await Day.findOne({ dayNo }).exec();
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    // Check if the teacher exists
    const teacher = await Teacher.findOne({ teacherName }).exec();
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if the course exists
    const course = await Course.findOne({ courseName }).exec();
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if the room exists
    const room = await Room.findOne({ roomNo }).exec();
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if the time slot exists
    const timeSlot = await TimeSlot.findOne({ timeSlotNo }).exec();
    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    // Check if the semester exists
    const semester = await Semester.findOne({ semesterName }).exec();
    if (!semester) {
      return res.status(404).json({ error: 'Semester not found' });
    }

    // Create a new full routine
    const fullRoutine = new FullRoutine({
      batchNo,
      sectionName,
      dayNo,
      teacherName,
      courseName,
      roomNo,
      semesterName,
      timeSlotNo
    });

    await fullRoutine.save();
    res.json(fullRoutine);
  } catch (error) {
    console.error('Error creating full routine:', error);
    res.status(500).json({ error: 'Failed to create full routine' });
  }
});

// Route to fetch data for creating a new full routine
// GET /fullRoutines/create
router.get('/create', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
  try {
    const batches = await Batch.find().exec();
    const sections = await Section.find().exec();
    const days = await Day.find().exec();
    const teachers = await Teacher.find().exec();
    const courses = await Course.find({ isActive: true }).exec();
    const rooms = await Room.find({ isActive: true }).exec();
    const timeSlots = await TimeSlot.find().exec();
    const semesters = await Semester.find({ isActive: true }).exec();

    res.json({ batches, sections, days, teachers, courses, rooms, timeSlots, semesters });
  } catch (error) {
    console.error('Error fetching data for create form:', error);
    res.status(500).json({ error: 'Failed to fetch data for create form' });
  }
});

// Route to edit a full routine
// GET /fullRoutines/edit?semesterName=<semesterName>&batchNo=<batchNo>&sectionName=<sectionName>&dayNo=<dayNo>&teacherName=<teacherName>&courseName=<courseName>&roomNo=<roomNo>&timeSlotNo=<timeSlotNo>
router.get('/:semesterName/edit', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
  try {
    const { semesterName, batchNo, sectionName, dayNo, teacherName, courseName, roomNo, timeSlotNo } = req.query;

    const fullRoutine = await FullRoutine.findOne({
      semesterName,
      batchNo,
      sectionName,
      dayNo,
      teacherName,
      courseName,
      roomNo,
      timeSlotNo,
    }).exec();

    if (!fullRoutine) {
      return res.status(404).json({ error: 'Full routine not found' });
    }

    const batches = await Batch.find().exec();
    const sections = await Section.find().exec();
    const days = await Day.find().exec();
    const teachers = await Teacher.find().exec();
    const courses = await Course.find({ isActive: true }).exec();
    const rooms = await Room.find({ isActive: true }).exec();
    const timeSlots = await TimeSlot.find().exec();
    const semesters = await Semester.find({ isActive: true }).exec();

    res.json({ fullRoutine, batches, sections, days, teachers, courses, rooms, timeSlots, semesters });
  } catch (error) {
    console.error('Error fetching full routine for edit:', error);
    res.status(500).json({ error: 'Failed to fetch full routine for edit' });
  }
});

// Route to update a full routine
// PUT /fullRoutines
// Request Body:
// {
//   "semesterName": "<semesterName>",
//   "batchNo": "<batchNo>",
//   "sectionName": "<sectionName>",
//   "dayNo": "<dayNo>",
//   "teacherName": "<teacherName>",
//   "courseName": "<courseName>",
//   "roomNo": "<roomNo>",
//   "timeSlotNo": "<timeSlotNo>"
// }
router.put('/:semesterName', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
  try {
    const { semesterName, batchNo, sectionName, dayNo, teacherName, courseName, roomNo, timeSlotNo } = req.body;

    // Validate input data
    if (!semesterName || !batchNo || !sectionName || !dayNo || !teacherName || !courseName || !roomNo || !timeSlotNo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the updated full routine already exists
    const existingFullRoutine = await FullRoutine.findOne({
      semesterName,
      batchNo,
      sectionName,
      dayNo,
      teacherName,
      courseName,
      roomNo,
      timeSlotNo,
    });
    if (existingFullRoutine) {
      return res.status(400).json({ error: 'Full routine with updated data already exists' });
    }

    // Update the full routine
    const updatedFullRoutine = await FullRoutine.findOneAndUpdate(
      {
        semesterName,
        batchNo,
        sectionName,
        dayNo,
        teacherName,
        courseName,
        roomNo,
        timeSlotNo,
      },
      {
        semesterName,
        batchNo,
        sectionName,
        dayNo,
        teacherName,
        courseName,
        roomNo,
        timeSlotNo,
      },
      { new: true }
    ).exec();

    if (!updatedFullRoutine) {
      return res.status(404).json({ error: 'Full routine not found' });
    }

    res.json({ message: 'Successfully updated', data: updatedFullRoutine });
  } catch (error) {
    console.error('Error updating full routine:', error);
    res.status(500).json({ error: 'Failed to update full routine' });
  }
});

// Route to delete a full routine
// DELETE /fullRoutines?semesterName=<semesterName>&batchNo=<batchNo>&sectionName=<sectionName>&dayNo=<dayNo>&teacherName=<teacherName>&courseName=<courseName>&roomNo=<roomNo>&timeSlotNo=<timeSlotNo>
router.delete('/:semesterName', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
  try {
    const { semesterName, batchNo, sectionName, dayNo, teacherName, courseName, roomNo, timeSlotNo } = req.query;

    const deletedFullRoutine = await FullRoutine.findOneAndDelete({
      semesterName,
      batchNo,
      sectionName,
      dayNo,
      teacherName,
      courseName,
      roomNo,
      timeSlotNo,
    }).exec();

    if (!deletedFullRoutine) {
      return res.status(404).json({ error: 'Full routine not found' });
    }

    res.json({ message: 'Successfully deleted', data: deletedFullRoutine });
  } catch (error) {
    console.error('Error deleting full routine:', error);
    res.status(500).json({ error: 'Failed to delete full routine' });
  }
});

module.exports = router;




                        //  previous









// const express = require("express");
// const router = express.Router();
// const FullRoutine = require("../models/FullRoutine");
// const Day = require("../models/Day");
// const DayWiseSlot = require("../models/DaySlot");
// const Batch = require("../models/Batch");
// const Section = require("../models/Section");
// const Teacher = require("../models/Teacher");
// const Course = require("../models/Course");
// const Room = require("../models/Room");
// const TimeSlot = require("../models/TimeSlot");
// const Semester = require("../models/Semester");
// const User = require("../models/User");
// const { Role, ROLES } = require('../models/Role');
// // const { authenticateUser, authorizeRole } = require('../utils/auth');


// // Middleware to check if the user is authorized
// const isAuthorized = (requiredRoles) => {
//   return (req, res, next) => {
//     const userRole = req.session.userRole;

//     if (requiredRoles.includes(userRole)) {
//       next();
//     } else {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//   };
// };

// // Route to fetch full routines
// // GET /fullRoutines/:semesterName
// router.get('/:semesterName', isAuthorized(['student', 'faculty', 'coordinator', 'programChair']), async (req, res) => {
//   try {
//     const semesterName = req.params.semesterName;
//     const fullRoutines = await FullRoutine.find({ semesterName }).exec();
//     res.json(fullRoutines);
//   } catch (error) {
//     console.error('Error fetching full routines:', error);
//     res.status(500).json({ error: 'Failed to fetch full routines' });
//   }
// });


// // Route to create a new full routine
// // POST /fullRoutines
// // Request Body: { batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo }
// router.post('/', isAuthorized(['coordinator', 'programChair']), async (req, res) => {
//   try {
//     const { batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo, } = req.body;

//     // Validate input data
//     if (!batchNo || !sectionName || !dayNo || !teacherName || !courseName || !roomNo || !semesterName || !timeSlotNo) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if the full routine already exists
//     const existingFullRoutine = await FullRoutine.findOne({ batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo, });
//     if (existingFullRoutine) {
//       return res.status(400).json({ error: 'Full routine already exists' });
//     }

//     // Create a new full routine
//     const newFullRoutine = new FullRoutine({ batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo, });
//     const savedFullRoutine = await newFullRoutine.save();
//     res.json({ message: 'Successfully created', data: savedFullRoutine });
//   } catch (error) {
//     console.error('Error creating full routine:', error);
//     res.status(500).json({ error: 'Failed to create full routine' });
//   }
// });

// // Route to fetch data for creating a new full routine
// // GET /fullRoutines/create
// router.get('/create', isAuthorized(['coordinator', 'programChair']), async (req, res) => {
//   try {
//     const batches = await Batch.find().exec();
//     const sections = await Section.find().exec();
//     const days = await Day.find().exec();
//     const teachers = await Teacher.find().exec();
//     const courses = await Course.find({ isActive: true }).exec();
//     const rooms = await Room.find({ isActive: true }).exec();
//     const timeSlots = await TimeSlot.find().exec();
//     const semesters = await Semester.find({ isActive: true }).exec();
//     res.json({ batches, sections, days, teachers, courses, rooms, timeSlots, semesters, });
//   } catch (error) {
//     console.error('Error fetching data for create form:', error);
//     res.status(500).json({ error: 'Failed to fetch data for create form' });
//   }
// });


// // Route to edit a full routine
// // GET /fullRoutines/edit/:routineId
// router.get('/edit/:routineId', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
//   try {
//     const routineId = req.params.routineId;

//     const fullRoutine = await FullRoutine.findById(routineId).exec();

//     if (!fullRoutine) {
//       return res.status(404).json({ error: 'Full routine not found' });
//     }

//     const batchData = await Batch.findOne({
//       batchNo: fullRoutine.batchNo,
//     }).exec();
//     const sectionData = await Section.findOne({
//       sectionName: fullRoutine.sectionName,
//     }).exec();
//     const dayData = await Day.findOne({ dayNo: fullRoutine.dayNo }).exec();
//     const teacherData = await Teacher.findOne({
//       teacherName: fullRoutine.teacherName,
//     }).exec();
//     const courseData = await Course.findOne({
//       courseName: fullRoutine.courseName,
//     }).exec();
//     const roomData = await Room.findOne({ roomNo: fullRoutine.roomNo }).exec();
//     const semesterData = await Semester.findOne({
//       semesterName: fullRoutine.semesterName,
//     }).exec();
//     const timeSlotData = await TimeSlot.findOne({
//       timeSlotNo: fullRoutine.timeSlotNo,
//     }).exec();

//     res.json({
//       fullRoutine,
//       batch: batchData,
//       section: sectionData,
//       day: dayData,
//       teacher: teacherData,
//       course: courseData,
//       room: roomData,
//       semester: semesterData,
//       timeSlot: timeSlotData,
//     });
//   } catch (error) {
//     console.error('Error fetching data for edit form:', error);
//     res.status(500).json({ error: 'Failed to fetch data for edit form' });
//   }
// });

// // Route to update a full routine
// // PUT /fullRoutines/:routineId
// // Request Body: { batchNo, sectionName, dayNo, teacherName, courseName, roomNo, semesterName, timeSlotNo }
// router.put('/:routineId', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
//   try {
//     const routineId = req.params.routineId;
//     const {
//       batchNo,
//       sectionName,
//       dayNo,
//       teacherName,
//       courseName,
//       roomNo,
//       semesterName,
//       timeSlotNo,
//     } = req.body;

//     // Find the existing FullRoutine document
//     const existingFullRoutine = await FullRoutine.findById(routineId);

//     if (!existingFullRoutine) {
//       return res.status(404).json({ error: 'Full routine not found' });
//     }

//     // Check if the updated full routine already exists
//     const updatedFullRoutine = await FullRoutine.findOne({
//       batchNo,
//       sectionName,
//       dayNo,
//       teacherName,
//       courseName,
//       roomNo,
//       semesterName,
//       timeSlotNo,
//       _id: { $ne: routineId },
//     });

//     if (updatedFullRoutine) {
//       return res.status(400).json({ error: 'Full routine already exists' });
//     }

//     // Update the existing FullRoutine document
//     existingFullRoutine.batchNo = batchNo;
//     existingFullRoutine.sectionName = sectionName;
//     existingFullRoutine.dayNo = dayNo;
//     existingFullRoutine.teacherName = teacherName;
//     existingFullRoutine.courseName = courseName;
//     existingFullRoutine.roomNo = roomNo;
//     existingFullRoutine.semesterName = semesterName;
//     existingFullRoutine.timeSlotNo = timeSlotNo;

//     const updatedFullRoutineData = await existingFullRoutine.save();

//     res.json(updatedFullRoutineData);
//   } catch (error) {
//     console.error('Error updating full routine:', error);
//     res.status(500).json({ error: 'Failed to update full routine' });
//   }
// });

// // Route to delete a full routine
// // DELETE /fullRoutines/:routineId
// router.delete('/:routineId', authenticateUser, authorizeRole('coordinator', 'programChair'), async (req, res) => {
//   try {
//   const routineId = req.params.routineId;

//     // Find the FullRoutine document
//     const fullRoutine = await FullRoutine.findById(routineId);

//     if (!fullRoutine) {
//       return res.status(404).json({ error: "Full routine not found" });
//     }

//     // Delete the found FullRoutine document
//     await FullRoutine.findByIdAndDelete(routineId);

//     res.json({ message: "Full routine deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting full routine:", error);
//     res.status(500).json({ error: "Failed to delete full routine" });
//   }
// });

