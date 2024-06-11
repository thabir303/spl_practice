// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  teacherId: {
    type: String, // Ensure this field is included and not commented out
    require : true,
    default: null,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;











// Hash the password before saving the user
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     return next(err);
//   }
// });
// // Define the program chair user
// const PROGRAM_CHAIR_USER = {
//   name: 'Program Chair',
//   email: 'programchair@iit.du.ac.bd',
//   password: 'programchairPassword',
//   role: 'programChair',
// };












// // models/User.js
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const userSchema = new Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true }, // Store the role name instead of a reference
// });

// const User = mongoose.model('User', userSchema);

// // Define the admin user
// const ADMIN_USER = {
//   name: 'Admin',
//   email: 'admin@iit.du.ac.bd',
//   password: 'adminpassword',
//   role: 'admin',
// };

// module.exports = { User, ADMIN_USER };
