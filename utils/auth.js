//utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = 'ihaveNoSecretKey@@'; // Replace with a strong secret key

// Define the program chair user
const PROGRAM_CHAIR_USER = {
  name: 'Program Chair',
  email: 'programchair@iit.du.ac.bd',
  password: 'programchairPassword',
  role: 'programChair',
};

const generateToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  // If the user is the program chair, skip token verification
  if (req.user && req.user.role === PROGRAM_CHAIR_USER.role) {
    next();
    return;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Error authenticating user:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { role } = req.user;
    if (allowedRoles.includes(role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
  };
};

module.exports = { generateToken, authenticateUser, authorizeRole, PROGRAM_CHAIR_USER };






// // utils/auth.js
// const { ADMIN_USER } = require('../models/User');

// const authenticateUser = (req, res, next) => {
//   const { email, password } = req.headers;

//   // Check if the user is the admin
//   if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
//     req.user = ADMIN_USER;
//     next();
//   } else {
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// };

// const authorizeRole = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const { role } = req.user;

//     if (allowedRoles.includes(role)) {
//       next();
//     } else {
//       res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
//     }
//   };
// };
// module.exports = { authenticateUser, authorizeRole };