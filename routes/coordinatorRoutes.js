// // routes/users.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { authorizeRole } = require('../utils/auth');
// const { ROLES } = require('../models/Role');

// // Route to create a new coordinator (accessible only to program chair)
// router.post('/coordinators', authorizeRole('programChair'), async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if the coordinator already exists
//     const existingCoordinator = await User.findOne({ email });
//     if (existingCoordinator) {
//       return res.status(400).json({ error: 'Coordinator already exists' });
//     }

//     // Create a new coordinator
//     const newCoordinator = new User({
//       name,
//       email,
//       password,
//       role: ROLES.coordinator.name,
//     });
//     const savedCoordinator = await newCoordinator.save();

//     res.json({ message: 'Coordinator created successfully', data: savedCoordinator });
//   } catch (error) {
//     console.error('Error creating coordinator:', error);
//     res.status(500).json({ error: 'Failed to create coordinator' });
//   }
// });

// module.exports = router;
