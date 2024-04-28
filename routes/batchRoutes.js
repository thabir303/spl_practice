// Import required modules
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const router = express.Router();
const Batch = require('../models/Batch');
const Department = require('../models/Department');
const Shift = require('../models/Shift');

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

module.exports = router;
