// routes/batchRoutes.js
// Import required modules
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const router = express.Router();
const Batch = require('../models/Batch');
const Coordinator = require('../models/Coordinator');
const ClassSlot = require('../models/ClassSlot');
// Add session middleware
router.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Add flash middleware
router.use(flash());

// Route to get all batches
// Method: GET
// URL: /api/batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// Route to create a new batch
// Method: POST
// URL: /api/batches
// Request Body:
// {
//   "batchNo": "B01",
//   "coordinatorId": "C001",
//   "coordinatorName": "John Doe"
// }
router.post('/', async (req, res) => {
  try {
    const { batchNo, coordinatorId, coordinatorName } = req.body;

    // Validate input data
    if (!batchNo || !coordinatorId || !coordinatorName) {
      req.flash('error', 'Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists
    const existingBatch = await Batch.findOne({ batchNo });
    if (existingBatch) {
      req.flash('error', 'Batch already assigned');
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Check if the coordinator exists
    // const coordinator = await Coordinator.findOne({ coordinatorId });
    // if (!coordinator) {
    //   req.flash('error', 'Coordinator not found');
    //   return res.status(404).json({ error: 'Coordinator not found' });
    // }

    // Create a new batch
    const newBatch = new Batch({ batchNo, coordinatorId, coordinatorName });
    const savedBatch = await newBatch.save();
    req.flash('success', 'Batch assigned successfully');
    res.json({ message: 'Batch assigned successfully', data: savedBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    req.flash('error', 'Failed to create batch');
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

// Route to get a batch by batchNo
// Method: GET
// URL: /api/batches/:batchNo
// Example: /api/batches/B01
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

// Route to update a batch
// Method: PUT
// URL: /api/batches/:batchNo
// Request Body:
// {
//   "coordinatorId": "C002",
//   "coordinatorName": "Jane Smith",
//   "isActive": true
// }
// Example: /api/batches/B01
router.put('/:batchNo', async (req, res) => {
  try {
    const { coordinatorId, coordinatorName, isActive } = req.body;
    const batchNo = req.params.batchNo;

    // Validate input data
    if (!coordinatorId || !coordinatorName) {
      req.flash('error', 'Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists (excluding the current batch)
    const existingBatch = await Batch.findOne({
      batchNo: { $ne: batchNo },
      coordinatorId,
    });
    if (existingBatch) {
      req.flash('error', 'Batch already assigned');
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Check if the coordinator exists
    const coordinator = await Coordinator.findOne({ coordinatorId });
    if (!coordinator) {
      req.flash('error', 'Coordinator not found');
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Update the batch
    const updatedBatch = await Batch.findOneAndUpdate(
      { batchNo },
      { coordinatorId, coordinatorName, isActive },
      { new: true }
    );
    if (!updatedBatch) {
      req.flash('error', 'Batch not found');
      return res.status(404).json({ error: 'Batch not found' });
    }
    req.flash('success', 'Batch updated successfully');
    res.json({ message: 'Batch updated successfully', data: updatedBatch });
  } catch (error) {
    console.error('Error updating batch:', error);
    req.flash('error', 'Failed to update batch');
    res.status(500).json({ error: 'Failed to update batch' });
  }
});

// Route to delete a batch
// Method: DELETE
// URL: /api/batches/:batchNo
// Example: /api/batches/B01
router.delete('/:batchNo', async (req, res) => {
  try {
    const batch = await Batch.findOneAndDelete({ batchNo: req.params.batchNo });
    if (!batch) {
      req.flash('error', 'Batch not found');
      return res.status(404).json({ error: 'Batch not found' });
    }
    req.flash('success', 'Batch deleted successfully');
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    req.flash('error', 'Failed to delete batch');
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});


// Route to update a batch
// Method: PUT
// URL: /api/batches/:batchNo
// Request Body:
// {
//   "coordinatorId": "C002",
//   "coordinatorName": "Jane Smith",
//   "isActive": true
// }
// Example: /api/batches/B01
// Route to update a batch
router.put('/:batchNo', async (req, res) => {
  try {
    const { coordinatorId, coordinatorName, isActive } = req.body;
    const lowercaseBatchNo = req.params.batchNo.toLowerCase(); // Convert to lowercase

    // Validate input data
    if (!coordinatorId || !coordinatorName) {
      req.flash('error', 'Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists (excluding the current batch)
    const existingBatch = await Batch.findOne({
      batchNo: { $ne: lowercaseBatchNo }, // Use lowercase
      coordinatorId,
    });
    if (existingBatch) {
      req.flash('error', 'Batch already assigned');
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // // Check if the coordinator exists
    // const coordinator = await Coordinator.findOne({ coordinatorId });
    // if (!coordinator) {
    //   req.flash('error', 'Coordinator not found');
    //   return res.status(404).json({ error: 'Coordinator not found' });
    // }

    // Update the batch
    const updatedBatch = await Batch.findOneAndUpdate(
      { batchNo: lowercaseBatchNo }, // Use lowercase
      { coordinatorId, coordinatorName, isActive },
      { new: true }
    );
    if (!updatedBatch) {
      req.flash('error', 'Batch not found');
      return res.status(404).json({ error: 'Batch not found' });
    }
    req.flash('success', 'Batch updated successfully');
    res.json({ message: 'Batch updated successfully', data: updatedBatch });
  } catch (error) {
    console.error('Error updating batch:', error);
    req.flash('error', 'Failed to update batch');
    res.status(500).json({ error: 'Failed to update batch' });
  }
});



// Route to delete a batch
// Method: DELETE
// URL: /api/batches/:batchNo
// Example: /api/batches/B01
// Route to delete a batch
router.delete('/:batchNo', async (req, res) => {
  try {
    const lowercaseBatchNo = req.params.batchNo.toLowerCase(); // Convert to lowercase
    const batch = await Batch.findOneAndDelete({ batchNo: lowercaseBatchNo });
    if (!batch) {
      req.flash('error', 'Batch not found');
      return res.status(404).json({ error: 'Batch not found' });
    }
    req.flash('success', 'Batch deleted successfully');
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    req.flash('error', 'Failed to delete batch');
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});



/////////////////////////////  Class-slots ////////////////////////////////


// Route to get all class slots
router.get('/class-slots', async (req, res) => {
  try {
    const batches = await Batch.find({}, 'batchNo');
    if (batches.length === 0) {
      req.flash('error', 'No batches found');
      return res.status(404).json({ error: 'No batches found' });
    }

    const classSlots = [];
    for (const batch of batches) {
      const batchClassSlots = await ClassSlot.find({ batchNo: batch.batchNo });
      classSlots.push(...batchClassSlots);
    }

    res.json(classSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    req.flash('error', 'Failed to fetch class slots');
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Route to create a new class slot
router.post('/class-slots', async (req, res) => {
  try {
    const { batchNo, day, startTime, endTime, courseId, teacherId, roomNo } = req.body;

    // Validate input data
    if (!batchNo || !day || !startTime || !endTime || !courseId || !teacherId || !roomNo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch exists
    const batch = await Batch.findOne({ batchNo });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if there's a class slot with the same time, teacher, and course for any other batch
    const conflictClassSlot = await ClassSlot.findOne({
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

    // Check if there's a class slot with the same time range for the same batch and course
    const overlappingClassSlot = await ClassSlot.findOne({
      batchNo,
      day,
      startTime: { $lt: endTime }, // Check if the start time of the new slot is before the end time of an existing slot
      endTime: { $gt: startTime }, // Check if the end time of the new slot is after the start time of an existing slot
      roomNo,
    });
    if (overlappingClassSlot) {
      return res.status(400).json({ error: 'Overlapping class slot' });
    }

    // Create a new class slot
    const newClassSlot = new ClassSlot({
      batchNo,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
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

// Route to get a class slot by batchNo
router.get('/class-slots/:batchNo', async (req, res) => {
  try {
    const classSlot = await ClassSlot.findOne({ batchNo: req.params.batchNo });
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
router.put('/class-slots/:batchNo', async (req, res) => {
  try {
    const { day, startTime, endTime, courseId, teacherId, roomNo } = req.body;
    const batchNo = req.params.batchNo;

    // Validate input data
    if (!day || !startTime || !endTime || !courseId || !teacherId || !roomNo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if there's a class slot with the same time, teacher, course, and room for any other batch
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

    // Check if there's a class slot with the same time range for the same batch, course, and room
    const overlappingClassSlot = await ClassSlot.findOne({
      batchNo,
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
      { batchNo },
      { day, startTime, endTime, courseId, teacherId, roomNo },
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
router.delete('/class-slots/:batchNo', async (req, res) => {
  try {
    const deleted = await ClassSlot.findOneAndDelete({ batchNo: req.params.batchNo });
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