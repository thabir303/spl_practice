// // routes/routineCommitteeRoutes.js
// const express = require('express');
// const router = express.Router();
// const RoutineCommittee = require('../models/RoutineCommittee');
// const Coordinator = require('../models/Coordinator');
// const nodemailer = require('nodemailer');
// require("dotenv").config();
// const path = require("path");

// // Configure nodemailer
// const transporter = nodemailer.createTransport({
//     // service: 'gmail', // Email service provider
//     host:'smtp.gmail.com',
//     port:465,
//     secure:true,
//     auth: {

//       user: 'tanvirhasanabir8@gmail.com',
//       pass: 'pyru dtnh ohce cujg',

//       // user: process.env.USER, // Your email address
//       // pass: process.env.APP_PASSWORD, // Your email password
//     },
//   });

// // Route to get all routine committees
// // GET /api/routine-committees
// router.get('/', async (req, res) => {
//   try {
//     const routineCommittees = await RoutineCommittee.find();
//     res.json(routineCommittees);
//   } catch (error) {
//     console.error('Error fetching routine committees:', error);
//     res.status(500).json({ error: 'Failed to fetch routine committees' });
//   }
// });

// // Route to get a routine committee by coordinatorId
// // GET /api/routine-committees/:coordinatorId
// router.get('/:coordinatorId', async (req, res) => {
//   try {
//     const coordinatorId = req.params.coordinatorId;
//     const routineCommittee = await RoutineCommittee.findOne({ coordinatorId });

//     if (!routineCommittee) {
//       return res.status(404).json({ error: 'Routine committee not found' });
//     }

//     res.json(routineCommittee);
//   } catch (error) {
//     console.error('Error fetching routine committee:', error);
//     res.status(500).json({ error: 'Failed to fetch routine committee' });
//   }
// });

// // Route to create a new routine committee
// // POST /api/routine-committees
// // Request Body: { coordinatorId, expired_date }
// router.post('/', async (req, res) => {
//   try {
//     const { coordinatorId, expired_date } = req.body;

//     // Validate input
//     if (!coordinatorId || !expired_date) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const expired_on = new Date(expired_date);

//     // Check if an active invitation already exists for the coordinator
//     const existingInvitation = await RoutineCommittee.findOne({
//       coordinatorId,
//       expired_date: { $gt: new Date() },
//     });

//     if (existingInvitation) {
//       return res.status(400).json({ error: 'Active invitation already exists' });
//     }

//     // Find the coordinator
//     const coordinator = await Coordinator.findOne({ coordinatorId });

//     if (!coordinator) {
//       return res.status(404).json({ error: 'Coordinator not found' });
//     }

//     // Create a new routine committee invitation
//     const routineCommittee = new RoutineCommittee({
//       coordinatorId,
//       expired_date: expired_on,
//     });

//     // Remove any existing invitations for the coordinator
//     await RoutineCommittee.deleteMany({ coordinatorId });

//     await routineCommittee.save();

//     // Send email invitation
//     const mailOptions = {
//       from: {
//         name: ' Routine Management System',
//         address: process.env.USER
//       },
//       to: coordinator.email, // Replace with the coordinator's email
//       subject: 'Routine Committee Invitation',
//       text: `You have been invited to join the routine committee. This invitation will expire on ${expired_on.toLocaleString()}.`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//       } else {
//         console.log('Email sent:', info.response);
//       }
//     });

//     res.status(201).json(routineCommittee);
//   } catch (error) {
//     console.error('Error creating routine committee:', error);
//     res.status(500).json({ error: 'Failed to create routine committee' });
//   }
// });

// // Route to update a routine committee
// // PUT /api/routine-committees/:coordinatorId
// // Request Body: { expired_date }
// router.put('/:coordinatorId', async (req, res) => {
//   try {
//     const coordinatorId = req.params.coordinatorId;
//     const { expired_date } = req.body;

//     // Validate input
//     if (!expired_date) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const expired_on = new Date(expired_date);

//     // Check if the routine committee exists
//     const routineCommittee = await RoutineCommittee.findOne({ coordinatorId });

//     if (!routineCommittee) {
//       return res.status(404).json({ error: 'Routine committee not found' });
//     }

//     // Update the routine committee
//     routineCommittee.expired_date = expired_on;
//     await routineCommittee.save();

//     res.json({ message: 'Routine committee updated successfully' });
//   } catch (error) {
//     console.error('Error updating routine committee:', error);
//     res.status(500).json({ error: 'Failed to update routine committee' });
//   }
// });

// // Route to delete a routine committee
// // DELETE /api/routine-committees/:coordinatorId
// router.delete('/:coordinatorId', async (req, res) => {
//   try {
//     const coordinatorId = req.params.coordinatorId;
//     const deletedRoutineCommittee = await RoutineCommittee.findOneAndDelete({ coordinatorId });

//     if (!deletedRoutineCommittee) {
//       return res.status(404).json({ error: 'Routine committee not found' });
//     }

//     res.json({ message: 'Routine committee deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting routine committee:', error);
//     res.status(500).json({ error: 'Failed to delete routine committee' });
//   }
// });


// module.exports = router;







// // Route to remove temporary routine access
// // PUT /api/routine-committees/temp-access
// // Request Body: { coordinatorId }
// //router.put('/tempAccess', async (req, res) => {
// //   try {
// //     const { coordinatorId } = req.body;

// //     // Validate input
// //     if (!coordinatorId) {
// //       return res.status(400).json({ error: 'Missing id required fields' });
// //     }

// //     // Update the routine committee's expiration date to the current date
// //     const result = await RoutineCommittee.updateMany(
// //       { coordinatorId },
// //       { $set: { expired_date: new Date() } }
// //     );

// //     if (result.modifiedCount === 0) {
// //       return res.status(404).json({ error: 'Coordinator not found in routine committee' });
// //     }

// //     res.json({ message: 'Temporary access removed' });
// //   } catch (error) {
// //     console.error('Error removing temporary access:', error);
// //     res.status(500).json({ error: 'Failed to remove temporary access' });
// //   }
// // });

// // // Route to update routine committee status
// // // PUT /api/routineCommittee/status
// // // Request Body: { coordinatorId, inCommittee }
// // router.put('/status', async (req, res) => {
// //   try {
// //     const { coordinatorId, in_committee } = req.body;

// //     // Validate input
// //     if (!coordinatorId || typeof in_committee !== 'Boolean') {
// //       return res.status(400).json({ error: 'Missing required fields' });
// //     }
// //      // Find the coordinator
// //      const coordinator = await Coordinator.findOne({ coordinatorId });
// //      if (!coordinator) {
// //        return res.status(404).json({ error: 'Coordinator not found' });
// //      }
// //     // Update the coordinator's committee status
// //     const result = await RoutineCommittee.updateOne(
// //       { coordinatorId },
// //       { $set: { in_committee: in_committee } }
// //     );

// //     if (result.modifiedCount === 0) {
// //       return res.status(404).json({ error: 'Coordinator not found in routine committee' });
// //     }

// //     res.json({ message: 'Routine committee status updated successfully' });
// //   } catch (error) {
// //     console.error('Error updating routine committee status:', error);
// //     res.status(500).json({ error: 'Failed to update routine committee status' });
// //   }
// // });
