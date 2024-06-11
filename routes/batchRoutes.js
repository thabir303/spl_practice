// routes/batchRoutes.js
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const router = express.Router();
const Batch = require('../models/Batch');
const Coordinator = require('../models/Coordinator');

// Add session middleware
router.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Add flash middleware
router.use(flash());

router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// POST: Create a new batch
router.post('/', async (req, res) => {
  try {
    const { batchNo, semesterName, coordinatorId } = req.body;

    // Validate input data
    if (!batchNo || !semesterName || !coordinatorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists
    const existingBatch = await Batch.findOne({ batchNo, semesterName });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Check if the coordinator is already assigned to another batch
    const existingCoordinator = await Batch.findOne({ coordinatorId });
    if (existingCoordinator) {
      return res.status(400).json({ error: 'Coordinator already assigned to another batch' });
    }

    // Fetch coordinator's email
    const coordinator = await Coordinator.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const newBatch = new Batch({ batchNo, semesterName, coordinatorId, coordinatorEmail: coordinator.email });
    const savedBatch = await newBatch.save();
    res.json({ message: 'Batch assigned successfully', data: savedBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

router.get('/:batchNo', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNo: req.params.batchNo });
    if (!batch) {
      req.flash('error', 'Batch not found');
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
    req.flash('error', 'Failed to fetch batch');
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

// PUT: Update a batch
router.put('/:batchNo', async (req, res) => {
  try {
    const { semesterName, coordinatorId, isActive } = req.body;
    const batchNo = req.params.batchNo;

    // Validate input data
    if (!coordinatorId || !semesterName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists (excluding the current batch)
    const existingBatch = await Batch.findOne({
      batchNo: { $ne: batchNo },
      semesterName,
      coordinatorId,
    });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Fetch coordinator's email
    const coordinator = await Coordinator.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Update the batch
    const updatedBatch = await Batch.findOneAndUpdate(
      { batchNo },
      { semesterName, coordinatorId, coordinatorEmail: coordinator.email, isActive },
      { new: true }
    );
    if (!updatedBatch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json({ message: 'Batch updated successfully', data: updatedBatch });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ error: 'Failed to update batch' });
  }
});

// DELETE: Delete a batch
router.delete('/:batchNo', async (req, res) => {
  try {
    const batch = await Batch.findOneAndDelete({ batchNo: req.params.batchNo });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

module.exports = router;



// router.delete('/:batchNo', async (req, res) => {
//   try {
//     const lowercaseBatchNo = req.params.batchNo.toLowerCase(); // Convert to lowercase
//     const batch = await Batch.findOneAndDelete({ batchNo: lowercaseBatchNo });
//     if (!batch) {
//       req.flash('error', 'Batch not found');
//       return res.status(404).json({ error: 'Batch not found' });
//     }
//     req.flash('success', 'Batch deleted successfully');
//     res.json({ message: 'Batch deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting batch:', error);
//     req.flash('error', 'Failed to delete batch');
//     res.status(500).json({ error: 'Failed to delete batch' });
//   }
// });

module.exports = router;





/////////////////////////////  Class-slots ////////////////////////////////


// Route to get all class slots








// router.get('/class-slots', async (req, res) => {
//   try {
//     const batches = await Batch.find({}, 'batchNo');

//     if (batches.length === 0) {
//       req.flash('error', 'No batches found');
//       return res.status(404).json({ error: 'No batches found' });
//     }

//     const classSlots = [];

//     for (const batch of batches) {
//       const batchClassSlots = await ClassSlot.find({ batchNo: batch.batchNo }).populate('roomNo', 'roomName').populate('courseId', 'courseName');

//       if (batchClassSlots.length > 0) {
//         classSlots.push(...batchClassSlots);
//       }
//     }

//     if (classSlots.length === 0) {
//       req.flash('error', 'No class slots found');
//       return res.status(404).json({ error: 'No class slots found' });
//     }

//     res.json(classSlots);
//   } catch (error) {
//     console.error('Error fetching class slots:', error);
//     req.flash('error', 'Failed to fetch class slots');
//     res.status(500).json({ error: 'Failed to fetch class slots' });
//   }
// });


// // Route to create a new class slot
// router.post('/class-slots', async (req, res) => {
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

//     // Check if there's a class slot with the same time, teacher, and course for any other batch
//     const conflictClassSlot = await ClassSlot.findOne({
//       day,
//       startTime,
//       endTime,
//       courseId,
//       teacherId,
//       roomNo,
//     });
//     if (conflictClassSlot) {
//       return res.status(400).json({ error: 'Class slot conflict' });
//     }

//     // Check if there's a class slot with the same time range for the same batch and course
//     const overlappingClassSlot = await ClassSlot.findOne({
//       batchNo,
//       day,
//       startTime: { $lt: endTime }, // Check if the start time of the new slot is before the end time of an existing slot
//       endTime: { $gt: startTime }, // Check if the end time of the new slot is after the start time of an existing slot
//       roomNo,
//     });
//     if (overlappingClassSlot) {
//       return res.status(400).json({ error: 'Overlapping class slot' });
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

// // Route to get a class slot by batchNo
// router.get('/class-slots/:batchNo', async (req, res) => {
//   try {
//     const classSlot = await ClassSlot.findOne({ batchNo: req.params.batchNo });
//     if (!classSlot) {
//       return res.status(404).json({ error: 'Class slot not found' });
//     }
//     res.json(classSlot);
//   } catch (error) {
//     console.error('Error fetching class slot:', error);
//     res.status(500).json({ error: 'Failed to fetch class slot' });
//   }
// });

// // Route to update a class slot
// router.put('/class-slots/:batchNo', async (req, res) => {
//   try {
//     const { day, startTime, endTime, courseId, teacherId, roomNo } = req.body;
//     const batchNo = req.params.batchNo;

//     // Validate input data
//     if (!day || !startTime || !endTime || !courseId || !teacherId || !roomNo) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if there's a class slot with the same time, teacher, course, and room for any other batch
//     const conflictClassSlot = await ClassSlot.findOne({
//       _id: { $ne: req.params.id }, // Exclude the current class slot being updated
//       day,
//       startTime,
//       endTime,
//       courseId,
//       teacherId,
//       roomNo,
//     });
//     if (conflictClassSlot) {
//       return res.status(400).json({ error: 'Class slot conflict' });
//     }

//     // Check if there's a class slot with the same time range for the same batch, course, and room
//     const overlappingClassSlot = await ClassSlot.findOne({
//       batchNo,
//       _id: { $ne: req.params.id }, // Exclude the current class slot being updated
//       day,
//       startTime: { $lt: endTime }, // Check if the start time of the new slot is before the end time of an existing slot
//       endTime: { $gt: startTime }, // Check if the end time of the new slot is after the start time of an existing slot
//       courseId,
//       roomNo,
//     });
//     if (overlappingClassSlot) {
//       return res.status(400).json({ error: 'Overlapping class slot' });
//     }

//     // Update the class slot
//     const updatedClassSlot = await ClassSlot.findOneAndUpdate(
//       { batchNo },
//       { day, startTime, endTime, courseId, teacherId, roomNo },
//       { new: true }
//     );

//     if (!updatedClassSlot) {
//       return res.status(404).json({ error: 'Class slot not found' });
//     }

//     res.json({ message: 'Class slot updated successfully', data: updatedClassSlot });
//   } catch (error) {
//     console.error('Error updating class slot:', error);
//     res.status(500).json({ error: 'Failed to update class slot' });
//   }
// });

// // Route to delete a class slot
// router.delete('/class-slots/:batchNo', async (req, res) => {
//   try {
//     const deleted = await ClassSlot.findOneAndDelete({ batchNo: req.params.batchNo });
//     if (!deleted) {
//       return res.status(404).json({ error: 'Class slot not found' });
//     }
//     res.json({ message: 'Class slot deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting class slot:', error);
//     res.status(500).json({ error: 'Failed to delete class slot' });
//   }
// });

module.exports = router; 