// routes/courseOfferRoutes.js
const express = require('express');
const router = express.Router();
const CourseOffer = require('../models/CourseOffer');
const Batch = require('../models/Batch');
const Course = require('../models/Course');

// Route to get all course offers
router.get('/', async (req, res) => {
  try {
    const courseOffers = await CourseOffer.find();
    res.json(courseOffers);
  } catch (error) {
    console.error('Error fetching course offers:', error);
    res.status(500).json({ error: 'Failed to fetch course offers' });
  }
});

// Route to create a new course offer
router.post('/', async (req, res) => {
  try {
    const { courseNames, batchNo } = req.body;

    // Validate input data
    if (!courseNames || !batchNo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the batch exists
    const batch = await Batch.findOne({ batchNo });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if the course offer already exists
    const existingCourseOffer = await CourseOffer.findOne({ batchNo });
    if (existingCourseOffer) {
      return res.status(400).json({ error: 'Course offer already exists' });
    }

    // Create a new course offer
    const newCourseOffer = new CourseOffer({ courseNames, batchNo });
    const savedCourseOffer = await newCourseOffer.save();
    res.json({ message: 'Course offer created successfully', data: savedCourseOffer });
  } catch (error) {
    console.error('Error creating course offer:', error);
    res.status(500).json({ error: 'Failed to create course offer' });
  }
});


// Route to update a course offer
// Request: PUT /api/course-offers/:batchNo
// Request Body: { courseNames: ["Course1", "Course3"], batchNo: "BATCH_001" }
// Response: { message: 'Course offer updated successfully', data: updatedCourseOffer }
// Route to update a course offer
// Request: PUT /api/course-offers/:batchNo
// Request Body: { courseNames: ["Course1", "Course3"] }
// Response: { message: 'Course offer updated successfully', data: updatedCourseOffer }
router.put('/:batchNo', async (req, res) => {
    try {
      const { courseNames } = req.body;
      const batchNo = req.params.batchNo;
  
      // Validate input data
      if (!courseNames || !batchNo) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Check if the batch exists
      const batch = await Batch.findOne({ batchNo });
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
  
      // Update the course offer
      const updatedCourseOffer = await CourseOffer.findOneAndUpdate(
        { batchNo },
        { courseNames },
        { new: true }
      );
  
      if (!updatedCourseOffer) {
        return res.status(404).json({ error: 'Course offer not found' });
      }
  
      res.json({ message: 'Course offer updated successfully', data: updatedCourseOffer });
    } catch (error) {
      console.error('Error updating course offer:', error);
      res.status(500).json({ error: 'Failed to update course offer' });
    }
});

  // Route to delete a course offer
  // Request: DELETE /api/course-offers/:batchNo
  // Response: { message: 'Course offer deleted successfully' }
  router.delete('/:batchNo', async (req, res) => {
    try {
      const batchNo = req.params.batchNo;
  
      // Check if the batch exists
      const batch = await Batch.findOne({ batchNo });
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
  
      const deletedCourseOffer = await CourseOffer.findOneAndDelete({ batchNo });
  
      if (!deletedCourseOffer) {
        return res.status(404).json({ error: 'Course offer not found' });
      }
  
      res.json({ message: 'Course offer deleted successfully' });
    } catch (error) {
      console.error('Error deleting course offer:', error);
      res.status(500).json({ error: 'Failed to delete course offer' });
    }
  });
  
  module.exports = router;