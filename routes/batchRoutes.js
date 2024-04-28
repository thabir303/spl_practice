const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Department = require('../models/Department');
const Shift = require('../models/Shift');

// Route to get all batches
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists
    const existingBatch = await Batch.findOne({ batchNo });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Create a new batch
    const newBatch = new Batch({ batchNo, departmentCode, shiftCode });
    const savedBatch = await newBatch.save();
    res.json({ message: 'Batch assigned successfully', data: savedBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});


// Route to get a batch by batchNo
router.get('/:batchNo', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNo: req.params.batchNo });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch already exists (excluding the current batch)
    const existingBatch = await Batch.findOne({
      batchNo: { $ne: batchNo },
      departmentCode,
      shiftCode,
    });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch already assigned' });
    }

    // Update the batch
    const updatedBatch = await Batch.findOneAndUpdate(
      { batchNo },
      { departmentCode, shiftCode, isActive },
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

// Route to delete a batch
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