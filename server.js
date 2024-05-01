// server.js (Node.js server)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const assignCourseRoutes = require('./routes/assignCourseRoutes');
app.use('/api/assign-courses', assignCourseRoutes);

const batchRoutes = require('./routes/batchRoutes');
app.use('/api/batches', batchRoutes);

const courseOfferRoutes = require('./routes/courseOfferRoutes');
app.use('/api/course-offers', courseOfferRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
