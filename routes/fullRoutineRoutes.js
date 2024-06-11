//routes/fullRoutineRoutes.js

const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const FullRoutine = require("../models/FullRoutine");
const Day = require("../models/Day");
const Section = require("../models/Section");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const Room = require("../models/Room");
const TimeSlot = require("../models/TimeSlot");
const Semester = require("../models/Semester");
const ClassSlot=require("../models/ClassSlot");

// Fetch the full routine
router.get('/', async (req, res) => {
  try {
    const fullRoutine = await FullRoutine.find();
    const populatedFullRoutine = await Promise.all(fullRoutine.map(async (routine) => {
      const teacher = await Teacher.findOne({ teacherId: routine.teacherId });
      const course = await Course.findOne({ courseId: routine.courseId });
      return {
        ...routine._doc,
        teacherName: teacher ? teacher.teacherName : 'N/A',
        courseName: course ? course.courseName : 'N/A',
      };
    }));
    res.json(populatedFullRoutine);
  } catch (error) {
    console.error('Error fetching full routine:', error);
    res.status(500).json({ error: 'Failed to fetch full routine' });
  }
});



// GET /fullRoutines/:batchNo
router.get("/batch/:batchNo", async (req, res) => {
  try {
    const batchNo = req.params.batchNo;
    const fullRoutines = await FullRoutine.find({ batchNo }).exec();
    res.json(fullRoutines);
  } catch (error) {
    console.error("Error fetching full routines:", error);
    res.status(500).json({ error: "Failed to fetch full routines" });
  }
});

// GET /fullRoutines/:semesterName
router.get("/:semesterName", async (req, res) => {
  try {
    const semesterName = req.params.semesterName;
    const fullRoutines = await FullRoutine.find({ semesterName }).exec();
    res.json(fullRoutines);
  } catch (error) {
    console.error("Error fetching full routines:", error);
    res.status(500).json({ error: "Failed to fetch full routines" });
  }
});

// Route to create a new full routine
router.post("/", async (req, res) => {
  try {
    const {
      section,
      day,
      startTime,
      endTime,
      teacherId,
      courseId,
      roomNo,
      semesterName,
      batchNo,
      classType
    } = req.body;

    // Validate input data
    if (!section || !day || !startTime || !endTime || !teacherId || !courseId || !roomNo || !semesterName || !batchNo || !classType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the section exists
    const sectionExists = await Section.findOne({ sectionName: section }).exec();
    if (!sectionExists) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Check if the day exists
    const dayExists = await Day.findOne({ dayNo: day }).exec();
    if (!dayExists) {
      return res.status(404).json({ error: "Day not found" });
    }

    // Check if the teacher exists
    const teacherExists = await Teacher.findOne({ teacherId }).exec();
    if (!teacherExists) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if the course exists
    const courseExists = await Course.findOne({ courseId }).exec();
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the room exists
    const roomExists = await Room.findOne({ roomNo }).exec();
    if (!roomExists) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if the semester exists
    const semesterExists = await Semester.findOne({ semesterName }).exec();
    if (!semesterExists) {
      return res.status(404).json({ error: "Semester not found" });
    }

    // Ensure no duplicate routine for the same batchNo and section within the same semester
    const existingFullRoutine = await FullRoutine.findOne({
      batchNo,
      section,
      semesterName
    }).exec();
    if (existingFullRoutine) {
      return res.status(400).json({ error: "Routine for the same section and batchNo within the same semester already exists" });
    }

    // Create a new full routine
    const fullRoutine = new FullRoutine({
      section,
      day,
      startTime,
      endTime,
      teacherId,
      courseId,
      roomNo,
      semesterName,
      batchNo,
      classType
    });

    await fullRoutine.save();
    res.json(fullRoutine);
  } catch (error) {
    console.error("Error creating full routine:", error);
    res.status(500).json({ error: "Failed to create full routine" });
  }
});

// Route to update a full routine
router.put("/:id", async (req, res) => {
  try {
    const {
      section,
      day,
      startTime,
      endTime,
      teacherId,
      courseId,
      roomNo,
      semesterName,
      batchNo,
      classType
    } = req.body;

     // Validate input data
     if (!section || !day || !startTime || !endTime || !teacherId || !courseId || !roomNo || !semesterName || !batchNo || !classType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the updated full routine already exists for the same section and batchNo within the same semester
    const existingFullRoutine = await FullRoutine.findOne({
      _id: { $ne: req.params.id },
      batchNo,
      section,
      semesterName
    }).exec();
    if (existingFullRoutine) {
      return res.status(400).json({ error: "Routine for the same section and batchNo within the same semester already exists" });
    }

     // Update the full routine
     const updatedFullRoutine = await FullRoutine.findByIdAndUpdate(
      req.params.id,
      {
        section,
        day,
        startTime,
        endTime,
        teacherId,
        courseId,
        roomNo,
        semesterName,
        batchNo,
        classType
      },
      { new: true }
    ).exec();

    if (!updatedFullRoutine) {
      return res.status(404).json({ error: "Full routine not found" });
    }

    res.json({ message: "Successfully updated", data: updatedFullRoutine });
  } catch (error) {
   console.error("Error updating full routine:", error);
    res.status(500).json({ error: "Failed to update full routine" });
  }
});


// Route to delete a full routine
router.delete("/:semesterName", async (req, res) => {
  try {
    const {
      semesterName,
      section,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      classType
    } = req.query;

    const deletedFullRoutine = await FullRoutine.findOneAndDelete({
      semesterName,
      section,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      classType
    }).exec();

    if (!deletedFullRoutine) {
      return res.status(404).json({ error: "Full routine not found" });
    }

    res.json({ message: "Successfully deleted", data: deletedFullRoutine });
  } catch (error) {
   console.error("Error deleting full routine:", error);
    res.status(500).json({ error: "Failed to delete full routine" });
  }
});

// Route to delete a full routine by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deletedFullRoutine = await FullRoutine.findByIdAndDelete(id);
    if (!deletedFullRoutine) {
      return res.status(404).json({ error: 'Full routine not found' });
    }

    res.json({ message: 'Full routine deleted successfully', data: deletedFullRoutine });
  } catch (error) {
    console.error('Error deleting full routine:', error);
    res.status(500).json({ error: 'Failed to delete full routine' });
  }
});

// Route to get class slots for a specific faculty and day
router.get('/class-slots', async (req, res) => {
  try {
    const { facultyId, day } = req.query;

    const classSlots = await ClassSlot.find({ teacherId: facultyId, day });
    res.json(classSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Fetch all routines for a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const routines = await FullRoutine.find({ teacherId });
    res.json(routines);
  } catch (error) {
    console.error('Error fetching routines for teacher:', error);
    res.status(500).json({ error: 'Failed to fetch routines for teacher' });
  }
});


// Route to reschedule a routine
router.put('/reschedule/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime, roomNo } = req.body;

    const updatedRoutine = await FullRoutine.findByIdAndUpdate(
      id,
      { day, startTime, endTime, roomNo },
      { new: true }
    );

    if (!updatedRoutine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    res.json({ message: 'Routine rescheduled successfully', data: updatedRoutine });
  } catch (error) {
    console.error('Error rescheduling routine:', error);
    res.status(500).json({ error: 'Failed to reschedule routine' });
  }
});


// Get a full routine by ID
router.get('/:id', async (req, res) => {
  try {
    const routineId = req.params.id;
    console.log('Fetching routine with ID:', routineId);

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      console.log('Invalid ID format:', routineId);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const routine = await FullRoutine.findById(routineId)
    .populate('teacherId', 'teacherName')
    .populate('courseId', 'courseName');
    
    if (!routine) {
      console.log('Routine not found with ID:', routineId);
      return res.status(404).json({ error: 'Routine not found' });
    }

    console.log('Routine found:', routine);
    res.json(routine);
  } catch (error) {
    console.error('Error fetching routine:', error);
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
});

router.get('/sorted-by-batch', async (req, res) => {
  try {
    const routines = await FullRoutine.find().sort({ batchNo: 1 });
    res.json(routines);
  } catch (error) {
    console.error('Error fetching sorted routines:', error);
    res.status(500).json({ error: 'Failed to fetch sorted routines' });
  }
});

router.get('/available-times', (req, res) => {
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  ];
  res.json(availableTimes);
});


router.post('/check-conflicts', async (req, res) => {
  try {
    const { routineId, startTime, endTime } = req.body;
    const conflict = await FullRoutine.findOne({
      _id: { $ne: routineId },
      $or: [
        { startTime: { $lte: endTime, $gte: startTime } },
        { endTime: { $gte: startTime, $lte: endTime } },
      ],
    });

    res.json({ conflict: !!conflict });
  } catch (error) {
    console.error('Error checking for conflicts:', error);
    res.status(500).json({ error: 'Failed to check for conflicts' });
  }
});

// routes/fullRoutineRoutes.js
router.get('/available-days', async (req, res) => {
  try {
    const days = await Day.find(); // Fetch days from your Day model
    res.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    res.status(500).json({ error: 'Failed to fetch days' });
  }
});

router.get('/available-rooms', async (req, res) => {
  try {
    const rooms = await Room.find(); // Fetch rooms from your Room model
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});



// routes/fullRoutineRoutes.js





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
// router.get('/:semesterName', isAuthorized(['student', 'teacher', 'coordinator', 'programChair']), async (req, res) => {
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
