// //controllers/DayController.js
// const Day = require('../models/Day');

// exports.index = async (req, res) => {
//   try {
//     const days = await Day.find();
//     res.json(days);
//   } catch (error) {
//     console.error('Error fetching days:', error);
//     res.status(500).json({ error: 'Failed to fetch days' });
//   }
// };

// exports.show = async (req, res) => {
//   try {
//     const day = await Day.findByDayNo(req.params.id);
//     if (!day) {
//       return res.status(404).json({ error: 'Day not found' });
//     }
//     res.json(day);
//   } catch (error) {
//     console.error('Error fetching day:', error);
//     res.status(500).json({ error: 'Failed to fetch day' });
//   }
// };