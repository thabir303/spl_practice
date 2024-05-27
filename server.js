const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://bsse1321:Abir123@restapi.nkqy7wr.mongodb.net/SPL-II?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Require models here
const User = require('./models/User');
const Section = require('./models/Section');
const Day = require('./models/Day');

// Require other models

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Check if sections already exist
    const existingSections = await Section.find({});
    if (existingSections.length === 0) {
      // Create new sections
      const sectionA = new Section({ sectionName: 'A' });
      const sectionB = new Section({ sectionName: 'B' });
      // Save sections to the database
      await Promise.all([sectionA.save(), sectionB.save()]);
    } else {
      //console.log('Sections already exist in the database.');
    }
  } catch (err) {
   // console.error('Error initializing sections:', err);
  }

  try {
    // Define the days to be created
    const daysToCreate = [
      { dayNo: 'Saturday' },
      { dayNo: 'Sunday' },
      { dayNo: 'Monday' },
      { dayNo: 'Tuesday' },
      { dayNo: 'Wednesday' },
      { dayNo: 'Thursday' },
      { dayNo: 'Friday' },
    ];

    // Check if days already exist in the database
    const existingDays = await Day.find();
    if (existingDays.length === 0) {
      // Create the days in the database
      const createdDays = await Day.createDays(daysToCreate);
      //console.log('Days created:', createdDays);
    } else {
      //console.log('Days already exist in the database.');
    }
  } catch (error) {
    //console.error('Error creating days:', error);
  }

  // try {
  //   // Define the semester names to be created
  //   const semesterNamesToCreate = [
  //     { semesterName: '1st' },
  //     { semesterName: '2nd' },
  //     { semesterName: '3rd' },
  //     { semesterName: '4th' },
  //     { semesterName: '5th' },
  //     { semesterName: '6th' },
  //     { semesterName: '7th' },
  //     { semesterName: '8th' },
  //   ];

  //   // Check if semester names already exist in the database
  //   const existingSemesters = await Semester.find();
  //   if (existingSemesters.length === 0) {
  //     // Create the semester names in the database
  //     const createdSemesters = await Semester.insertMany(semesterNamesToCreate);
  //     //console.log('Semesters created:', createdSemesters);
  //   } else {
  //     //console.log('Semesters already exist in the database.');
  //   }
  // } catch (error) {
  //   //console.error('Error creating semesters:', error);
  // }

});

app.use(
  session({
    secret: 'ihavenoSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

// Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const assignCourseRoutes = require('./routes/assignCourseRoutes');
app.use('/api/assign-courses', assignCourseRoutes);

const batchRoutes = require('./routes/batchRoutes');
app.use('/api/batches', batchRoutes);

const classSlotsRoutes = require('./routes/classSlotsRoutes');
app.use('/api/class-slots', classSlotsRoutes);

const courseOfferRoutes = require('./routes/courseOfferRoutes');
app.use('/api/course-offers', courseOfferRoutes);

const dayRoutes = require('./routes/dayRoutes');
app.use('/api/days', dayRoutes);

const fullRoutineRoutes = require('./routes/fullRoutineRoutes');
app.use('/api/fullRoutines', fullRoutineRoutes);

const roomRoutes = require('./routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

const semesterRoutes =require('./routes/semesterRoutes');
app.use('/api/semesters',semesterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});