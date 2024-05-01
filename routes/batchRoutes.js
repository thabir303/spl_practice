//routes/batchRoutes.js
// Import required modules
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const router = express.Router();
const Batch = require('../models/Batch');
const Department = require('../models/Department');
const Shift = require('../models/Shift');
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
router.post('/', async (req, res) => {
  try {
    const { batchNo, departmentCode, shiftCode } = req.body;

    // Validate input data
    if (!batchNo || !departmentCode || !shiftCode) {
      req.flash('error', 'Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists
    const existingBatch = await Batch.findOne({ batchNo });
    if (existingBatch) {
      req.flash('error', 'Batch already assigned');
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Create a new batch
    const newBatch = new Batch({ batchNo, departmentCode, shiftCode });
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
router.put('/:batchNo', async (req, res) => {
  try {
    const { departmentCode, shiftCode, isActive } = req.body;
    const batchNo = req.params.batchNo;

    // Validate input data
    if (!departmentCode || !shiftCode) {
      req.flash('error', 'Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists (excluding the current batch)
    const existingBatch = await Batch.findOne({
      batchNo: { $ne: batchNo },
      departmentCode,
      shiftCode,
    });
    if (existingBatch) {
      req.flash('error', 'Batch already assigned');
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Update the batch
    const updatedBatch = await Batch.findOneAndUpdate(
      { batchNo },
      { departmentCode, shiftCode, isActive },
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




/////////////////////////////  Class-slots ////////////////////////////////





// Route to get all class slots
router.get('/class-slots', async (req, res) => {
  try {
    const classSlots = await ClassSlot.find();
    
    if (!classSlots || classSlots.length === 0) {
      return res.status(404).json({ error: 'No class slots found' });
    }
    
    res.json(classSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});



// Route to create a new class slot
router.post('/class-slots', async (req, res) => {
  try {
    const { batchNo, day, startTime, endTime, courseId, teacherId } = req.body;

    // Validate input data
    if (!batchNo || !day || !startTime || !endTime || !courseId || !teacherId) {
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
      teacherId
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
    const classSlot = await ClassSlot.findByBatchNo(req.params.batchNo);
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
    const { day, startTime, endTime, courseId, teacherId } = req.body;
    const batchNo = req.params.batchNo;

    // Validate input data
    if (!day || !startTime || !endTime || !courseId || !teacherId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the class slot
    const updatedClassSlot = await ClassSlot.updateByBatchNo(batchNo, {
      day,
      startTime,
      endTime,
      courseId,
      teacherId
    });

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
    const deleted = await ClassSlot.deleteByBatchNo(req.params.batchNo);
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