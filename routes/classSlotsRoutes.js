//routes/classSlotsRoutes.js
const express = require('express');
const router = express.Router();
const ClassSlot = require('../models/ClassSlot');
const Semester = require('../models/Semester');
const Day = require('../models/Day');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Section = require('../models/Section');
// const { isProgramChair, isCoordinator } = require('../middlewares/authMiddleware');
const {
  generateToken,
  authenticateUser,
  authorizeRole,
  PROGRAM_CHAIR_USER,
} = require("../utils/auth");

// Create a new class slot
router.post('/',  async (req, res) => {
  try {
    const { semesterName, day, startTime, endTime, courseId, teacherId, roomNo, section, classType } = req.body;

    // Validate input data
    if (!semesterName || !day || !startTime || !endTime || !courseId || !teacherId || !roomNo || !section || !classType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if endTime is after startTime
    if (new Date(`1970-01-01T${endTime}:00`) <= new Date(`1970-01-01T${startTime}:00`)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check for existence of each field
    const semester = await Semester.findOne({ semesterName });
    if (!semester) return res.status(404).json({ error: 'Semester not found' });

    const dayExists = await Day.findOne({ dayNo: day });
    if (!dayExists) return res.status(404).json({ error: 'Day not found' });

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const room = await Room.findOne({ roomNo });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const sectionExists = await Section.findOne({ sectionName: section });
    if (!sectionExists) return res.status(404).json({ error: 'Section not found' });

    if (!['Lab', 'Theory'].includes(classType)) {
      return res.status(400).json({ error: 'Invalid class type' });
    }

    // Check if the course is assigned to the given semester
    if (course.semesterName !== semesterName) {
      return res.status(400).json({
        error: `Course ${course.courseId} is assigned to semester ${course.semesterName}, but you are trying to use it in semester ${semesterName}.`,
        solution: `Please use the course in its assigned semester (${course.semesterName}).`
      });
    }
    // Check for time conflicts within the same semester, room, teacher, and section
    const conflictMessages = [];

    const conflictClassSlots = await ClassSlot.find({
      semesterName,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    conflictClassSlots.forEach(slot => {
      if (slot.roomNo === roomNo && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for the same section.');
      }
      if (slot.roomNo === roomNo && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for a different section.');
      }
      if (slot.teacherId === teacherId && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for the same section.');
      }
      if (slot.teacherId === teacherId && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for a different section.');
      }
      if (slot.section === section && slot.roomNo !== roomNo) {
        conflictMessages.push('Conflict: Overlapping class slot for the same section in different rooms.');
      }
    });

    if (conflictMessages.length > 0) {
      return res.status(400).json({ error: conflictMessages });
    }

    // Create a new class slot
    const newClassSlot = new ClassSlot({
      semesterName,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      section,
      classType
    });

    const savedClassSlot = await newClassSlot.save();
    res.json({ message: 'Class slot created successfully', data: savedClassSlot });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ error: 'Class slot already exists for the given combination' });
    }

    console.error('Error creating class slot:', error);
    res.status(500).json({ error: 'Failed to create class slot' });
  }
});


// Route to get all class slots
router.get('/', async (req, res) => {
  try {
    const classSlots = await ClassSlot.find().lean(); // .lean() for better performance
    const populatedClassSlots = await Promise.all(
      classSlots.map(async (slot) => {
        const teacher = await Teacher.findOne({ teacherId: slot.teacherId });
        return {
          ...slot,
          teacherName: teacher ? teacher.teacherName : 'N/A',
        };
      })
    );
    res.json(populatedClassSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});


// Fetch a single class slot by ID and populate teacher name
router.get('/:id', async (req, res) => {
  try {
    const classSlot = await ClassSlot.findById(req.params.id).populate('teacherId', 'teacherName');
    if (!classSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }
    res.json(classSlot);
  } catch (error) {
    console.error('Error fetching class slot:', error);
    res.status(500).json({ error: 'Failed to fetch class slot' });
  }
});


// Route to fetch teacher name for a given class slot and teacher ID
router.get('/:id/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findOne({ teacherId });
    // console.log(teacher);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ teacherName: teacher.teacherName });
  } catch (error) {
    console.error('Error fetching teacher name:', error);
    res.status(500).json({ error: 'Failed to fetch teacher name' });
  }
});


// Route to update a class slot by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { semesterName, day, startTime, endTime, courseId, teacherId, roomNo, section, classType } = req.body;

    // Validate input data
    if (!semesterName || !day || !startTime || !endTime || !courseId || !teacherId || !roomNo || !section || !classType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for existence of each field
    const semester = await Semester.findOne({ semesterName });
    if (!semester) return res.status(404).json({ error: 'Semester not found' });

    const dayExists = await Day.findOne({ dayNo: day });
    if (!dayExists) return res.status(404).json({ error: 'Day not found' });

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const room = await Room.findOne({ roomNo });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const sectionExists = await Section.findOne({ sectionName: section });
    if (!sectionExists) return res.status(404).json({ error: 'Section not found' });

    if (!['Lab', 'Theory'].includes(classType)) {
      return res.status(400).json({ error: 'Invalid class type' });
    }

    // Check if the course is assigned to the given semester
    if (course.semesterName !== semesterName) {
      return res.status(400).json({
        error: `Course ${course.courseId} is assigned to semester ${course.semesterName}, but you are trying to use it in semester ${semesterName}.`,
        solution: `Please use the course in its assigned semester (${course.semesterName}).`
      });
    }

    // Check for valid time
    if (new Date(`1970-01-01T${startTime}Z`) >= new Date(`1970-01-01T${endTime}Z`)) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    // Check for time conflicts within the same semester, room, teacher, and section
    const conflictMessages = [];

    const conflictClassSlots = await ClassSlot.find({
      _id: { $ne: id }, // Exclude the current class slot being updated
      semesterName,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    conflictClassSlots.forEach(slot => {
      if (slot.roomNo === roomNo && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for the same section.');
      }
      if (slot.roomNo === roomNo && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for a different section.');
      }
      if (slot.teacherId === teacherId && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for the same section.');
      }
      if (slot.teacherId === teacherId && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for a different section.');
      }
      if (slot.section === section && slot.roomNo !== roomNo) {
        conflictMessages.push('Conflict: Overlapping class slot for the same section in different rooms.');
      }
    });

    if (conflictMessages.length > 0) {
      return res.status(400).json({ error: conflictMessages });
    }

    // Update the class slot
    const updatedClassSlot = await ClassSlot.findByIdAndUpdate(id, {
      semesterName,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      section,
      classType
    }, { new: true });

    res.json({ message: 'Class slot updated successfully', data: updatedClassSlot });
  } catch (error) {
    console.error('Error updating class slot:', error);
    res.status(500).json({ error: 'Failed to update class slot' });
  }
});

// Route to delete a class slot by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedClassSlot = await ClassSlot.findByIdAndDelete(req.params.id);
    if (!deletedClassSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }
    res.json({ message: 'Class slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting class slot:', error);
    res.status(500).json({ error: 'Failed to delete class slot' });
  }
});

// Route to fetch teacher name by class slot ID and teacher ID
router.get('/:id/:teacherId', async (req, res) => {
  try {
    const { id, teacherId } = req.params;

    // Find the class slot by ID
    const classSlot = await ClassSlot.findById(id);
    if (!classSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }

    // Verify the teacher ID matches the one in the class slot
    if (classSlot.teacherId !== teacherId) {
      return res.status(404).json({ error: 'Teacher not found in this class slot' });
    }

    // Find the teacher by ID
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Return the teacher name
    res.json({ teacherName: teacher.teacherName });
  } catch (error) {
    console.error('Error fetching teacher name:', error);
    res.status(500).json({ error: 'Failed to fetch teacher name' });
  }
});

module.exports = router;




















// // Import required modules
// const express = require('express');
// const session = require('express-session');
// const flash = require('connect-flash');
// const router = express.Router();
// const Batch = require('../models/Batch');
// // const Coordinator = require('../models/Coordinator');
// const ClassSlot = require('../models/ClassSlot');
// // Add session middleware
// router.use(session({
//   secret: 'secret-key',
//   resave: false,
//   saveUninitialized: false
// }));

// // Add flash middleware
// router.use(flash());


// router.get('/', async (req, res) => {
//     try {
//       const batches = await Batch.find({}, 'batchNo');
  
//       if (batches.length === 0) {
//         req.flash('error', 'No batches found');
//         return res.status(404).json({ error: 'No batches found' });
//       }
  
//       const classSlots = [];
  
//       for (const batch of batches) {
//         const batchClassSlots = await ClassSlot.find({ batchNo: batch.batchNo }).populate('roomNo', 'roomName').populate('courseId', 'courseName');
  
//         if (batchClassSlots.length > 0) {
//           classSlots.push(...batchClassSlots);
//         }
//       }
  
//       if (classSlots.length === 0) {
//         req.flash('error', 'No class slots found');
//         return res.status(404).json({ error: 'No class slots found' });
//       }
  
//       res.json(classSlots);
//     } catch (error) {
//       console.error('Error fetching class slots:', error);
//       req.flash('error', 'Failed to fetch class slots');
//       res.status(500).json({ error: 'Failed to fetch class slots' });
//     }
//   });
  
  
// // Create a new class slot
// router.post('/', async (req, res) => {
//   try {
//     const { batchNo, day, startTime, endTime, courseId, teacherId, roomNo } = req.body;

//     // Validate input data
//     if (!batchNo || !day || !startTime || !endTime || !courseId || !teacherId || !roomNo) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if the batch exists
//     const batch = await Batch.findOne({ batchNo });
//     if (!batch) {
//       return res.status(404).json({ error: 'Batch not found' });
//     }

//     // Check for time conflicts within the same batch
//     const conflictClassSlot = await ClassSlot.findOne({
//       batchNo,
//       day,
//       $or: [
//         {
//           startTime: { $lt: endTime },
//           endTime: { $gt: startTime }
//         }
//       ]
//     });

//     if (conflictClassSlot) {
//       return res.status(400).json({ error: 'Class slot conflict. Overlapping with another class slot.' });
//     }

//     // Create a new class slot
//     const newClassSlot = new ClassSlot({
//       batchNo,
//       day,
//       startTime,
//       endTime,
//       courseId,
//       teacherId,
//       roomNo,
//     });

//     const savedClassSlot = await newClassSlot.save();
//     res.json({ message: 'Class slot created successfully', data: savedClassSlot });
//   } catch (error) {
//     if (error.code === 11000) {
//       // Handle duplicate key error
//       return res.status(400).json({ error: 'Class slot already exists for the given combination' });
//     }

//     console.error('Error creating class slot:', error);
//     res.status(500).json({ error: 'Failed to create class slot' });
//   }
// });

  
//   // Route to get a class slot by batchNo
//   router.get('/:batchNo', async (req, res) => {
//     try {
//       const classSlot = await ClassSlot.findOne({ batchNo: req.params.batchNo });
//       if (!classSlot) {
//         return res.status(404).json({ error: 'Class slot not found' });
//       }
//       res.json(classSlot);
//     } catch (error) {
//       console.error('Error fetching class slot:', error);
//       res.status(500).json({ error: 'Failed to fetch class slot' });
//     }
//   });
  
//   // Route to update a class slot
//   router.put('/:batchNo', async (req, res) => {
//     try {
//       const { day, startTime, endTime, courseId, teacherId, roomNo } = req.body;
//       const batchNo = req.params.batchNo;
  
//       // Validate input data
//       if (!day || !startTime || !endTime || !courseId || !teacherId || !roomNo) {
//         return res.status(400).json({ error: 'Missing required fields' });
//       }
  
//       // Check if there's a class slot with the same time, teacher, course, and room for any other batch
//       const conflictClassSlot = await ClassSlot.findOne({
//         _id: { $ne: req.params.id }, // Exclude the current class slot being updated
//         day,
//         startTime,
//         endTime,
//         courseId,
//         teacherId,
//         roomNo,
//       });
//       if (conflictClassSlot) {
//         return res.status(400).json({ error: 'Class slot conflict' });
//       }
  
//       // Check if there's a class slot with the same time range for the same batch, course, and room
//       const overlappingClassSlot = await ClassSlot.findOne({
//         batchNo,
//         _id: { $ne: req.params.id }, // Exclude the current class slot being updated
//         day,
//         startTime: { $lt: endTime }, // Check if the start time of the new slot is before the end time of an existing slot
//         endTime: { $gt: startTime }, // Check if the end time of the new slot is after the start time of an existing slot
//         courseId,
//         roomNo,
//       });
//       if (overlappingClassSlot) {
//         return res.status(400).json({ error: 'Overlapping class slot' });
//       }
  
//       // Update the class slot
//       const updatedClassSlot = await ClassSlot.findOneAndUpdate(
//         { batchNo },
//         { day, startTime, endTime, courseId, teacherId, roomNo },
//         { new: true }
//       );
  
//       if (!updatedClassSlot) {
//         return res.status(404).json({ error: 'Class slot not found' });
//       }
  
//       res.json({ message: 'Class slot updated successfully', data: updatedClassSlot });
//     } catch (error) {
//       console.error('Error updating class slot:', error);
//       res.status(500).json({ error: 'Failed to update class slot' });
//     }
//   });
  
//   // Route to delete a class slot
//   router.delete('/:batchNo', async (req, res) => {
//     try {
//       const deleted = await ClassSlot.findOneAndDelete({ batchNo: req.params.batchNo });
//       if (!deleted) {
//         return res.status(404).json({ error: 'Class slot not found' });
//       }
//       res.json({ message: 'Class slot deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting class slot:', error);
//       res.status(500).json({ error: 'Failed to delete class slot' });
//     }
// });

// module.exports = router; 