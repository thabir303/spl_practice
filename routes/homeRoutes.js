// routes/routineRoutes.js
const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Section = require('../models/Section');
const Day = require('../models/Day');
const Routine = require('../models/Routine');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Route to fetch routine data
router.get('/routine', async (req, res) => {
  try {
    const batches = await Batch.aggregate([
      {
        $lookup: {
          from: 'sections',
          localField: 'sections',
          foreignField: '_id',
          as: 'sections',
        },
      },
      // Add any additional lookups or projections as needed
    ]);

    res.render('routine', { batches });
  } catch (error) {
    console.error('Error fetching routine data:', error);
    res.status(500).json({ error: 'Failed to fetch routine data' });
  }
});

// Route to view routine
router.get('/routine-view', async (req, res) => {
  try {
    const { batchId, sectionId } = req.query;

    const batch = await Batch.findOne({ _id: batchId })
      .populate('sections')
      .populate('shiftId')
      .populate('departmentId')
      .lean();

    const slots = await Day.aggregate([
      {
        $lookup: {
          from: 'routines',
          let: { dayId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$batchId', batchId] },
                    ...(sectionId ? [{ $eq: ['$sectionId', sectionId] }] : []),
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
              },
            },
            {
              $lookup: {
                from: 'teachers',
                localField: 'teacherId',
                foreignField: '_id',
                as: 'teacher',
              },
            },
            {
              $lookup: {
                from: 'rooms',
                localField: 'roomId',
                foreignField: '_id',
                as: 'room',
              },
            },
          ],
          as: 'routine',
        },
      },
    ]);

    const dayWiseSlots = await Day.aggregate([
      {
        $lookup: {
          from: 'timeslots',
          localField: '_id',
          foreignField: 'dayId',
          as: 'timeSlot',
        },
      },
    ]);

    res.render('routine_view', { slots, batch, dayWiseSlots });
  } catch (error) {
    console.error('Error fetching routine view data:', error);
    res.status(500).json({ error: 'Failed to fetch routine view data' });
  }
});

// Route to print routine
router.get('/routine-print', async (req, res) => {
  try {
    const { batchId, sectionId } = req.query;

    const batch = await Batch.findOne({ _id: batchId })
      .populate('sections')
      .populate('shiftId')
      .populate('departmentId')
      .lean();

    const slots = await Day.aggregate([
      {
        $lookup: {
          from: 'routines',
          let: { dayId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$batchId', batchId] },
                    ...(sectionId ? [{ $eq: ['$sectionId', sectionId] }] : []),
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
              },
            },
            {
              $lookup: {
                from: 'teachers',
                localField: 'teacherId',
                foreignField: '_id',
                as: 'teacher',
              },
            },
            {
              $lookup: {
                from: 'rooms',
                localField: 'roomId',
                foreignField: '_id',
                as: 'room',
              },
            },
          ],
          as: 'routine',
        },
      },
    ]);

    const dayWiseSlots = await Day.aggregate([
      {
        $lookup: {
          from: 'timeslots',
          localField: '_id',
          foreignField: 'dayId',
          as: 'timeSlot',
        },
      },
    ]);

    const pdfName = `${batch.departmentId.name}_${batch.name}_${batch.shiftId.slug}${batch.sections.length > 0 ? `_${batch.sections[0].name}` : ''}`;

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=routine_${pdfName}.pdf`);
    pdfDoc.pipe(res);
    // Add PDF generation logic here
    pdfDoc.end();
  } catch (error) {
    console.error('Error generating routine PDF:', error);
    res.status(500).json({ error: 'Failed to generate routine PDF' });
  }
});

module.exports = router;