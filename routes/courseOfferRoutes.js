// // routes/courseOfferRoutes.js
// const express = require('express');
// const router = express.Router();
// const CourseOffer = require('../models/CourseOffer');
// const Semester = require('../models/Semester');
// const Course = require('../models/Course');
// const { authenticateUser, authorizeRole } = require('../utils/auth');

// // Middleware to ensure the user is the program chair
// const isProgramChair = (req, res, next) => {
//   if (req.session.isProgramChairLoggedIn) {
//     req.user = { role: "programChair" };
//     next();
//   } else {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
// };

// // Route to get all course offers
// router.get('/', async (req, res) => {
//   try {
//     const courseOffers = await CourseOffer.find();
//     const result = [];

//     for (const offer of courseOffers) {
//       const courses = await Course.find({ courseId: { $in: offer.courseIds } }, 'courseName courseId');
//       result.push({
//         semesterName: offer.semesterName,
//         courses
//       });
//     }

//     res.json(result);
//   } catch (error) {
//     console.error('Error fetching course offers:', error);
//     res.status(500).json({ error: 'Failed to fetch course offers' });
//   }
// });

// // Route to create a new course offer
// router.post('/', isProgramChair, async (req, res) => {
//   try {
//     const { courseIds, semesterName } = req.body;

//     // Validate input data
//     if (!courseIds || !semesterName) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if the semester exists
//     const semester = await Semester.findOne({ semesterName });
//     if (!semester) {
//       return res.status(404).json({ error: 'Semester not found' });
//     }

//     // Check if all courses exist
//     for (const courseId of courseIds) {
//       const course = await Course.findOne({ courseId });
//       if (!course) {
//         return res.status(404).json({ error: `Course with ID ${courseId} not found` });
//       }
//     }

//     // Check if the course offer already exists
//     const existingCourseOffer = await CourseOffer.findOne({ semesterName });
//     if (existingCourseOffer) {
//       return res.status(400).json({ error: 'Course offer already exists' });
//     }

//     // Create a new course offer
//     const newCourseOffer = new CourseOffer({ courseIds, semesterName });
//     const savedCourseOffer = await newCourseOffer.save();
//     res.json({ message: 'Course offer created successfully', data: savedCourseOffer });
//   } catch (error) {
//     console.error('Error creating course offer:', error);
//     res.status(500).json({ error: 'Failed to create course offer' });
//   }
// });

// // Route to get a course offer by semesterName
// router.get('/:semesterName', async (req, res) => {
//   try {
//     const semesterName = req.params.semesterName;

//     // Check if the semester exists
//     const semester = await Semester.findOne({ semesterName });
//     if (!semester) {
//       return res.status(404).json({ error: 'Semester not found' });
//     }

//     // Find the course offer by semesterName
//     const courseOffer = await CourseOffer.findOne({ semesterName });
//     if (!courseOffer) {
//       return res.status(404).json({ error: 'Course offer not found' });
//     }

//     const courses = await Course.find({ courseId: { $in: courseOffer.courseIds } }, 'courseName courseId');
//     res.json({ semesterName: courseOffer.semesterName, courses });
//   } catch (error) {
//     console.error('Error fetching course offer:', error);
//     res.status(500).json({ error: 'Failed to fetch course offer' });
//   }
// });

// // Route to update a course offer
// router.put('/:semesterName', isProgramChair, async (req, res) => {
//   try {
//     const { courseIds } = req.body;
//     const semesterName = req.params.semesterName;

//     // Validate input data
//     if (!courseIds || !semesterName) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if the semester exists
//     const semester = await Semester.findOne({ semesterName });
//     if (!semester) {
//       return res.status(404).json({ error: 'Semester not found' });
//     }

//     // Check if all courses exist
//     for (const courseId of courseIds) {
//       const course = await Course.findOne({ courseId });
//       if (!course) {
//         return res.status(404).json({ error: `Course with ID ${courseId} not found` });
//       }
//     }

//     // Update the course offer
//     const updatedCourseOffer = await CourseOffer.findOneAndUpdate(
//       { semesterName },
//       { courseIds },
//       { new: true }
//     );

//     if (!updatedCourseOffer) {
//       return res.status(404).json({ error: 'Course offer not found' });
//     }

//     res.json({ message: 'Course offer updated successfully', data: updatedCourseOffer });
//   } catch (error) {
//     console.error('Error updating course offer:', error);
//     res.status(500).json({ error: 'Failed to update course offer' });
//   }
// });

// // Route to delete a course offer
// router.delete('/:semesterName', isProgramChair, async (req, res) => {
//   try {
//     const semesterName = req.params.semesterName;

//     // Check if the semester exists
//     const semester = await Semester.findOne({ semesterName });
//     if (!semester) {
//       return res.status(404).json({ error: 'Semester not found' });
//     }

//     const deletedCourseOffer = await CourseOffer.findOneAndDelete({ semesterName });

//     if (!deletedCourseOffer) {
//       return res.status(404).json({ error: 'Course offer not found' });
//     }

//     res.json({ message: 'Course offer deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting course offer:', error);
//     res.status(500).json({ error: 'Failed to delete course offer' });
//   }
// });

// module.exports = router;






// // // routes/courseOfferRoutes.js
// // const express = require('express');
// // const router = express.Router();
// // const CourseOffer = require('../models/CourseOffer');
// // const Batch = require('../models/Batch');
// // // const Course = require('../models/Course');

// // // Route to get all course offers
// // router.get('/', async (req, res) => {
// //   try {
// //     const courseOffers = await CourseOffer.find();
// //     res.json(courseOffers);
// //   } catch (error) {
// //     console.error('Error fetching course offers:', error);
// //     res.status(500).json({ error: 'Failed to fetch course offers' });
// //   }
// // });

// // // Route to create a new course offer
// // router.post('/', async (req, res) => {
// //   try {
// //     const { courseNames, batchNo } = req.body;

// //     // Validate input data
// //     if (!courseNames || !batchNo) {
// //       return res.status(400).json({ error: 'Missing required fields' });
// //     }

// //     // Check if the batch exists
// //     const batch = await Batch.findOne({ batchNo });
// //     if (!batch) {
// //       return res.status(404).json({ error: 'Batch not found' });
// //     }

// //     // Check if the course offer already exists
// //     const existingCourseOffer = await CourseOffer.findOne({ batchNo });
// //     if (existingCourseOffer) {
// //       return res.status(400).json({ error: 'Course offer already exists' });
// //     }

// //     // Create a new course offer
// //     const newCourseOffer = new CourseOffer({ courseNames, batchNo });
// //     const savedCourseOffer = await newCourseOffer.save();
// //     res.json({ message: 'Course offer created successfully', data: savedCourseOffer });
// //   } catch (error) {
// //     console.error('Error creating course offer:', error);
// //     res.status(500).json({ error: 'Failed to create course offer' });
// //   }
// // });

// // // Route to get a course offer by batchNo
// // router.get('/:batchNo', async (req, res) => {
// //   try {
// //     const batchNo = req.params.batchNo;

// //     // Check if the batch exists
// //     const batch = await Batch.findOne({ batchNo });
// //     if (!batch) {
// //       return res.status(404).json({ error: 'Batch not found' });
// //     }

// //     // Find the course offer by batchNo
// //     const courseOffer = await CourseOffer.findOne({ batchNo });
// //     if (!courseOffer) {
// //       return res.status(404).json({ error: 'Course offer not found' });
// //     }

// //     res.json(courseOffer);
// //   } catch (error) {
// //     console.error('Error fetching course offer:', error);
// //     res.status(500).json({ error: 'Failed to fetch course offer' });
// //   }
// // });
// // // Route to update a course offer
// // router.put('/:batchNo', async (req, res) => {
// //     try {
// //       const { courseNames } = req.body;
// //       const batchNo = req.params.batchNo;
  
// //       // Validate input data
// //       if (!courseNames || !batchNo) {
// //         return res.status(400).json({ error: 'Missing required fields' });
// //       }
  
// //       // Check if the batch exists
// //       const batch = await Batch.findOne({ batchNo });
// //       if (!batch) {
// //         return res.status(404).json({ error: 'Batch not found' });
// //       }
  
// //       // Update the course offer
// //       const updatedCourseOffer = await CourseOffer.findOneAndUpdate(
// //         { batchNo },
// //         { courseNames },
// //         { new: true }
// //       );
  
// //       if (!updatedCourseOffer) {
// //         return res.status(404).json({ error: 'Course offer not found' });
// //       }
  
// //       res.json({ message: 'Course offer updated successfully', data: updatedCourseOffer });
// //     } catch (error) {
// //       console.error('Error updating course offer:', error);
// //       res.status(500).json({ error: 'Failed to update course offer' });
// //     }
// // });

// //   // Route to delete a course offer
// //   // Request: DELETE /api/course-offers/:batchNo
// //   // Response: { message: 'Course offer deleted successfully' }
// // router.delete('/:batchNo', async (req, res) => {
// //     try {
// //       const batchNo = req.params.batchNo;
  
// //       // Check if the batch exists
// //       const batch = await Batch.findOne({ batchNo });
// //       if (!batch) {
// //         return res.status(404).json({ error: 'Batch not found' });
// //       }
  
// //       const deletedCourseOffer = await CourseOffer.findOneAndDelete({ batchNo });
  
// //       if (!deletedCourseOffer) {
// //         return res.status(404).json({ error: 'Course offer not found' });
// //       }
  
// //       res.json({ message: 'Course offer deleted successfully' });
// //     } catch (error) {
// //       console.error('Error deleting course offer:', error);
// //       res.status(500).json({ error: 'Failed to delete course offer' });
// //     }
// //   });
  
// //   module.exports = router;