// //controllers/DayWiseSlotController.js
// const Day = require('../models/Day');
// const DaySlot = require('../models/DaySlot');
// const TimeSlot = require('../models/TimeSlot');

// exports.index = async (req, res) => {
//   try {
//     const days = await Day.find();
//     const daySlots = await Promise.all(
//       days.map(async (day) => {
//         const slots = await DaySlot.findByDayNo(day.dayNo);
//         return { day, slots };
//       })
//     );
//     res.json(daySlots);
//   } catch (error) {
//     console.error('Error fetching day-wise slots:', error);
//     res.status(500).json({ error: 'Failed to fetch day-wise slots' });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const day = await Day.findByDayNo(req.params.id);
//     if (!day) {
//       return res.status(404).json({ error: 'Day not found' });
//     }
//     const timeSlots = await TimeSlot.find();
//     res.json({ day, timeSlots });
//   } catch (error) {
//     console.error('Error fetching day and time slots:', error);
//     res.status(500).json({ error: 'Failed to fetch day and time slots' });
//   }
// };

// exports.store = async (req, res) => {
//     try {
//       const { dayNo, day_wise_slot } = req.body;
//       if (!day_wise_slot || day_wise_slot.length === 0) {
//         return res.status(400).json({ error: 'No Class/Time Slot selected' });
//       }
  
//       const day = await Day.findOne({ dayNo });
//       if (!day) {
//         return res.status(404).json({ error: 'Day not found' });
//       }
  
//       await DaySlot.deleteMany({ dayNo });
  
//       const newSlots = day_wise_slot.map((slot) => ({
//         dayNo,
//         timeSlotNo: slot.time_slot,
//         classSlot: slot.class_slot,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }));
  
//       const savedSlots = await DaySlot.insertMany(newSlots);
//       res.json({ message: 'Time slots & Class slot assigned successfully', data: savedSlots });
//     } catch (error) {
//       console.error('Error creating day-wise slots:', error);
//       res.status(500).json({ error: 'Failed to create day-wise slots' });
//     }
//   };