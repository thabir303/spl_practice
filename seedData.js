const mongoose = require('mongoose');
const Day = require('./models/Day');

// MongoDB connection
mongoose.connect('mongodb+srv://bsse1321:Abir123@restapi.nkqy7wr.mongodb.net/SPL-II?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to the database');

    // Define the days to be created
    const daysToCreate = [
      { dayNo: 'saturday' },
      { dayNo: 'sunday' },
      { dayNo: 'monday' },
      { dayNo: 'tuesday' },
      { dayNo: 'wednesday' },
      { dayNo: 'thursday' },
      { dayNo: 'friday' },
    ];

    // Create the days in the database
    Day.createDays(daysToCreate)
      .then((createdDays) => {
        console.log('Days created:', createdDays);
        mongoose.disconnect();
      })
      .catch((error) => {
        console.error('Error creating days:', error);
        mongoose.disconnect();
      });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });