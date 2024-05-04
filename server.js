//server.js
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
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Import the Day model
  const Day = require('./models/Day');

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
    console.error('Error creating days:', error);
  }
});

app.use(
  session({
    secret: 'ihavenoSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth',authRoutes);

const assignCourseRoutes = require('./routes/assignCourseRoutes');
app.use('/api/assign-courses', assignCourseRoutes);


const batchRoutes = require('./routes/batchRoutes');
app.use('/api/batches', batchRoutes);


const courseOfferRoutes = require('./routes/courseOfferRoutes');
app.use('/api/course-offers', courseOfferRoutes);


const dayRoutes = require('./routes/dayRoutes');
app.use('/api/days', dayRoutes);

const fullRoutineRoutes = require('./routes/fullRoutineRoutes');
app.use('/api/fullRoutines', fullRoutineRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});