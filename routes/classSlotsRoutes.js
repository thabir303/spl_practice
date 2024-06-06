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

// Middleware to ensure the user is either program chair or coordinator
const isAuthorizedUser = (req, res, next) => {
  if (req.session.isProgramChairLoggedIn || req.session.isCoordinatorLoggedIn) {
    req.user = { role: req.session.isProgramChairLoggedIn ? "admin" : "coordinator" };
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized from" });
  }
};

// Create a new class slot
router.post('/', isAuthorizedUser, async (req, res) => {
  try {
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
      if (slot.roomNo === roomNo) {
        if (slot.section === section) {
          conflictMessages.push('Conflict: Overlapping class slot in the same room for the same section.');
        } else {
          conflictMessages.push('Conflict: Overlapping class slot in the same room for a different section.');
        }
      }
      if (slot.teacherId === teacherId) {
        if (slot.section === section) {
          conflictMessages.push('Conflict: Overlapping class slot with the same teacher for the same section.');
        } else {
          conflictMessages.push('Conflict: Overlapping class slot with the same teacher for a different section.');
        }
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


// Fetch all class slots
router.get('/', isAuthorizedUser, async (req, res) => {
  try {
    const semesters = await Semester.find({}, 'semesterName');

    if (semesters.length === 0) {
      req.flash('error', 'No semesters found');
      return res.status(404).json({ error: 'No semesters found' });
    }

    const classSlots = [];

    for (const semester of semesters) {
      const semesterClassSlots = await ClassSlot.find({ semesterName: semester.semesterName });

      if (semesterClassSlots.length > 0) {
        classSlots.push(...semesterClassSlots);
      }
    }

    if (classSlots.length === 0) {
      req.flash('error', 'No class slots found');
      return res.status(404).json({ error: 'No class slots found' });
    }

    res.json(classSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    req.flash('error', 'Failed to fetch class slots');
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Route to get a class slot by semesterName
router.get('/:semesterName', isAuthorizedUser, async (req, res) => {
  try {
    const classSlot = await ClassSlot.findOne({ semesterName: req.params.semesterName });
    if (!classSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }
    res.json(classSlot);
  } catch (error) {
    console.error('Error fetching class slot:', error);
    res.status(500).json({ error: 'Failed to fetch class slot' });
  }
});

// Route to update a class slot
router.put('/:semesterName', isAuthorizedUser, async (req, res) => {
  try {
    const { day, startTime, endTime, courseId, teacherId, roomNo, section, classType } = req.body;
    const semesterName = req.params.semesterName;

    // Validate input data
    if (!day || !startTime || !endTime || !courseId || !teacherId || !roomNo || !section || !classType) {
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

    if (!['lab', 'theory'].includes(classType)) {
      return res.status(400).json({ error: 'Invalid class type' });

    }

    // Check if there's a class slot with the same time, teacher, course, and room for any other semester
    const conflictClassSlot = await ClassSlot.findOne({
      _id: { $ne: req.params.id }, // Exclude the current class slot being updated
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
    });
    if (conflictClassSlot) {
      return res.status(400).json({ error: 'Class slot conflict' });
    }

    // Check if there's a class slot with the same time range for the same semester, course, and room
    const overlappingClassSlot = await ClassSlot.findOne({
      semesterName,
      _id: { $ne: req.params.id }, // Exclude the current class slot being updated
      day,
      startTime: { $lt: endTime }, // Check if the start time of the new slot is before the end time of an existing slot
      endTime: { $gt: startTime }, // Check if the end time of the new slot is after the start time of an existing slot
      courseId,
      roomNo,
    });
    if (overlappingClassSlot) {
      return res.status(400).json({ error: 'Overlapping class slot' });
    }

    // Update the class slot
    const updatedClassSlot = await ClassSlot.findOneAndUpdate(
      { semesterName },
      { day, startTime, endTime, courseId, teacherId, roomNo, section, classType },
      { new: true }
    );

    if (!updatedClassSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }

    res.json({ message: 'Class slot updated successfully', data: updatedClassSlot });
  } catch (error) {
    console.error('Error updating class slot:', error);
    res.status(500).json({ error: 'Failed to update class slot' });
  }
});

// Route to delete a class slot
router.delete('/:semesterName', isAuthorizedUser, async (req, res) => {
  try {
    const deleted = await ClassSlot.findOneAndDelete({ semesterName: req.params.semesterName });
    if (!deleted) {
      return res.status(404).json({ error: 'Class slot not found' });
    }
    res.json({ message: 'Class slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting class slot:', error);
    res.status(500).json({ error: 'Failed to delete class slot' });
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