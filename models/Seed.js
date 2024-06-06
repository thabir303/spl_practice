// // seed.js
// const User = require('./models/User');
// const Role = require('./models/Role');

// // Fetch the role IDs
// const studentRole = await Role.findOne({ name: 'student' });
// const teacherRole = await Role.findOne({ name: 'teacher' });
// const coordinatorRole = await Role.findOne({ name: 'coordinator' });
// const programChairRole = await Role.findOne({ name: 'programChair' });

// // Seed the User collection
// await User.create([
//   { name: 'John Doe', email: 'john@example.com', password: 'password123', role: studentRole._id, createdBy: 'admin', editedBy: 'admin' },
//   { name: 'Jane Smith', email: 'jane@example.com', password: 'password456', role: teacherRole._id, createdBy: 'admin', editedBy: 'admin' },
//   { name: 'Bob Johnson', email: 'bob@example.com', password: 'password789', role: coordinatorRole._id, createdBy: 'admin', editedBy: 'admin' },
//   { name: 'Alice Williams', email: 'alice@example.com', password: 'passwordabc', role: programChairRole._id, createdBy: 'admin', editedBy: 'admin' },
// ]);
