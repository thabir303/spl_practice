// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

const RoutineCommittee = require("../models/RoutineCommittee");
const Coordinator = require("../models/Coordinator");
const nodemailer = require("nodemailer");
const uuid = require("uuid");
const {
  generateToken,
  authenticateUser,
  authorizeRole,
  PROGRAM_CHAIR_USER,
} = require("../utils/auth");
const { ROLES } = require("../models/Role");

// Configure nodemailer
const transporter = nodemailer.createTransport({
  // service: 'gmail', // Email service provider
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "tanvirhasanabir8@gmail.com",
    pass: "pyru dtnh ohce cujg",

    // user: process.env.USER, // Your email address
    // pass: process.env.APP_PASSWORD, // Your email password
  },
});

// Middleware to check if the user is the program chair
const isProgramChair = (req, res, next) => {
  // Check if the program chair is logged in
  if (req.session.isProgramChairLoggedIn) {
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized (pC)" });
  }
};

// Middleware to check if the user is a coordinator
const isCoordinator = (req, res, next) => {
  if (req.session.isCoordinatorLoggedIn) {
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized ngg" });
  }
};

// Middleware to check if the user is approved
const isUserApproved = (req, res, next) => {
  if (req.session.user && req.session.user.status === "approved") {
    next();
  } else {
    return res
      .status(403)
      .json({
        error: "Account not approved. Please contact the program chair.",
      });
  }
};

// Route for user signup (only for students and teacher)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userId = uuid.v4(); // Generate a unique userId using uuid

    if (
      !Object.values(ROLES)
        .map((r) => r.name)
        .includes(role) ||
      role === "coordinator" ||
      role === "admin"
    ) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      status: "pending",
    });
    const savedUser = await newUser.save();

    res.json({
      message: "User created successfully, pending approval",
      data: savedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to sign up" });
  }
});

router.post("/approveUser", async (req, res) => {
  try {
    const { email, batchNo, teacherId } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.status === "approved") {
      return res.status(400).json({ error: "User already approved" });
    }
    user.status = "approved";
    await user.save();

    // Save user data to the respective schema
    if (user.role === "teacher") {
      if (!teacherId) {
        return res.status(400).json({ error: "teacherId is required for teacher approval" });
      }

      const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email: user.email }] });
      if (existingTeacher) {
        return res.status(400).json({ error: "Teacher ID or email already exists" });
      }

      const newTeacher = new Teacher({
        teacherId,
        teacherName: user.name,
        email: user.email,
        departmentName: "IIT", // Set default or retrieve from request body
        assignedCourses: [] // Initialize with an empty array
      });
      await newTeacher.save();
      console.log("Teacher created:", newTeacher);
    } else if (user.role === "student") {
      if (!batchNo) {
        return res.status(400).json({ error: "batchNo is required for student approval" });
      }

      const existingStudent = await Student.findOne({ $or: [{ studentId: user.userId }, { email: user.email }] });
      if (existingStudent) {
        return res.status(400).json({ error: "Student ID or email already exists" });
      }

      const newStudent = new Student({
        studentId: user.userId,
        name: user.name,
        email: user.email,
        batchNo,
      });
      await newStudent.save();
      console.log("Student created:", newStudent);
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    console.log("User approved:", user);
    res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Error during user approval:", error);
    res.status(500).json({ error: "Failed to approve user", details: error.message });
  }
});

// Route for user login (including students and teacher)


// routes/authRoutes.js


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received with:", { email, password });

    // Check if the user is the program chair
    if (email === PROGRAM_CHAIR_USER.email && password === PROGRAM_CHAIR_USER.password) {
      req.session.isProgramChairLoggedIn = true;
      req.session.user = PROGRAM_CHAIR_USER; // Store user info in session
      const token = generateToken(PROGRAM_CHAIR_USER); // Generate token
      return res.json({ ...PROGRAM_CHAIR_USER, token, role: 'admin' });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the user is a coordinator
    if (user.role === "coordinator") {
      req.session.isCoordinatorLoggedIn = true;
      req.session.user = { role: "coordinator", email: user.email }; // Store user info in session
      const token = generateToken(user); // Generate token
      return res.json({ message: "Coordinator logged in successfully", token, role: user.role });
    }

    // Check if the user's status is approved for other roles
    if (user.status !== "approved") {
      return res.status(403).json({
        error: "Your Account is not approved yet. You will be notified once approved.",
      });
    }

    req.session.user = {
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // Generate a token for the user
    const token = generateToken(user);
    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// Logout route for all users
router.post("/logout", (req, res) => {
  if (req.session.isProgramChairLoggedIn) {
    req.session.isProgramChairLoggedIn = false;
    req.session.user = null; // Clear user data from session
  } else if (req.session.isCoordinatorLoggedIn) {
    req.session.isCoordinatorLoggedIn = false;
    req.session.user = null; // Clear user data from session
  }
  res.clearCookie("connect.sid"); // Clear the cookie that holds the session ID
  res.json({ message: "Logged out successfully" });
});

// Example protected route
router.get("/protected", (req, res) => {
  res.json({ message: "You have access to this protected route." });
});

// Route for creating a new coordinator (accessible only to program chair)
router.post("/coordinators", async (req, res) => {
  try {
    const { name, email, password, batchNo, coordinatorId, expired_date } =
      req.body;

    // Check if the coordinator already exists
    const existingCoordinator = await Coordinator.findOne({ email });
    if (existingCoordinator) {
      return res.status(400).json({ error: "Coordinator already exists" });
    }

    // Check if the coordinator already exists in User schema
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Check if the coordinatorId is unique
    const existingCoordinatorId = await Coordinator.findOne({ coordinatorId });
    if (existingCoordinatorId) {
      return res.status(400).json({ error: "CoordinatorId already exists" });
    }

     // Check if the batchNo is unique
     const existingBatchNo = await Coordinator.findOne({ batchNo });
     if (existingBatchNo) {
       return res.status(400).json({ error: "Batch number already assigned to another coordinator" });
     }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Coordinator document
    const newCoordinator = new Coordinator({
      coordinatorId,
      coordinatorName: name,
      email,
      password,
      batchNo,
      expired_date: new Date(expired_date), // Add the expired_date field
    });

    await newCoordinator.save();

    // Create a new User document
    const newUser = new User({
      userId: coordinatorId,
      name,
      email,
      password: hashedPassword,
      role: "coordinator",
    });

    await newUser.save();

    // Create a new routine committee invitation
    const routineCommittee = new RoutineCommittee({
      coordinatorId,
      expired_date: new Date(expired_date),
    });

    await routineCommittee.save();

    // Send email invitation
    const mailOptions = {
      from: {
        name: " Routine Management System",
        address: process.env.USER,
      },
      to: email, // Replace with the coordinator's email
      subject: "Routine Committee Invitation",
      text: `You have been invited to join the routine committee. This invitation will expire on ${expired_date.toLocaleString()}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({
      message: "Coordinator created successfully",
      data: newCoordinator,
    });
  } catch (error) {
    console.error("Error creating coordinator:", error);
    res.status(500).json({ error: "Failed to create coordinator" });
  }
});

// Route to get all coordinators
router.get('/coordinators', async (req, res) => {
  try {
    const coordinators = await Coordinator.find().lean();

    // Fetch the in_committee status for each coordinator
    const coordinatorsWithCommitteeStatus = await Promise.all(coordinators.map(async (coordinator) => {
      const routineCommittee = await RoutineCommittee.findOne({ coordinatorId: coordinator.coordinatorId });
      return {
        ...coordinator,
        in_committee: !!routineCommittee,
      };
    }));

    res.json(coordinatorsWithCommitteeStatus);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ error: 'Failed to fetch coordinators' });
  }
});

// Route to get a coordinator by ID
router.get('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const coordinatorId = req.params.coordinatorId;
    const coordinator = await Coordinator.findOne({ coordinatorId }).lean();

    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Fetch the in_committee status
    const routineCommittee = await RoutineCommittee.findOne({ coordinatorId });
    const coordinatorWithCommitteeStatus = {
      ...coordinator,
      in_committee: !!routineCommittee,
    };

    res.json(coordinatorWithCommitteeStatus);
  } catch (error) {
    console.error('Error fetching coordinator:', error);
    res.status(500).json({ error: 'Failed to fetch coordinator' });
  }
});



// Route to update a coordinator
router.put('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const { name, email, batchNo, expired_date } = req.body;

    // Check if the coordinator exists
    const coordinator = await Coordinator.findOne({ coordinatorId });
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

     // Check if the batchNo is unique
     if (batchNo && batchNo !== coordinator.batchNo) {
      const existingBatchNo = await Coordinator.findOne({ batchNo });
      if (existingBatchNo) {
        return res.status(400).json({ error: "Batch number already assigned to another coordinator" });
      }
    }

    // Update the coordinator details
    coordinator.coordinatorName = name || coordinator.coordinatorName;
    coordinator.email = email || coordinator.email;
    coordinator.batchNo = batchNo || coordinator.batchNo;
    coordinator.expired_date = expired_date ? new Date(expired_date) : coordinator.expired_date;

    await coordinator.save();

    // Also update the User document if email was changed
    if (email) {
      const user = await User.findOne({ userId: coordinatorId });
      user.email = email;
      await user.save();
    }

    res.json({ message: 'Coordinator updated successfully', data: coordinator });
  } catch (error) {
    console.error('Error updating coordinator:', error);
    res.status(500).json({ error: 'Failed to update coordinator' });
  }
});

// Route to delete a coordinator
router.delete('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;

    const deletedCoordinator = await Coordinator.findOneAndDelete({ coordinatorId });
    if (!deletedCoordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Also delete the corresponding User document
    await User.findOneAndDelete({ userId: coordinatorId });

    res.json({ message: 'Coordinator deleted successfully' });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({ error: 'Failed to delete coordinator' });
  }
});


router.post("/routine-committees", async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    // Check if the coordinator exists
    const coordinator = await Coordinator.findOne({ coordinatorId });
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Check if the routine committee already exists
    const existingRoutineCommittee = await RoutineCommittee.findOne({ coordinatorId });
    if (existingRoutineCommittee) {
      return res.status(400).json({ error: 'Routine committee already exists for this coordinator' });
    }

    const routineCommittee = new RoutineCommittee({
      coordinatorId,
      expired_date: coordinator.expired_date,
    });

    await routineCommittee.save();

    res.json({ message: 'Routine committee added successfully', data: routineCommittee });
  } catch (error) {
    console.error('Error adding routine committee:', error);
    res.status(500).json({ error: 'Failed to add routine committee' });
  }
});

// Route to get all routine committees
// GET /api/routine-committees
router.get("/routine-committees",  async (req, res) => {
  try {
    const routineCommittees = await RoutineCommittee.find();
    res.json(routineCommittees);
  } catch (error) {
    console.error("Error fetching routine committees:", error);
    res.status(500).json({ error: "Failed to fetch routine committees" });
  }
});

// Route to get a routine committee by coordinatorId
// GET /api/routine-committees/:coordinatorId
router.get(
  "/routine-committees/:coordinatorId",
  async (req, res) => {
    try {
      const coordinatorId = req.params.coordinatorId;
      const routineCommittee = await RoutineCommittee.findOne({
        coordinatorId,
      });

      if (!routineCommittee) {
        return res.status(404).json({ error: "Routine committee not found" });
      }

      res.json(routineCommittee);
    } catch (error) {
      console.error("Error fetching routine committee:", error);
      res.status(500).json({ error: "Failed to fetch routine committee" });
    }
  }
);

// Route to update a routine committee
// PUT /api/routine-committees/:coordinatorId
// Request Body: { expired_date }
router.put(
  "/routine-committees/:coordinatorId",
  async (req, res) => {
    try {
      const coordinatorId = req.params.coordinatorId;
      const { expired_date, in_committee } = req.body;

      // Check if the routine committee exists
      const routineCommittee = await RoutineCommittee.findOne({
        coordinatorId,
      });
      if (!routineCommittee) {
        return res.status(404).json({ error: "Routine committee not found" });
      }

      // Update the routine committee fields
      if (expired_date) {
        const expired_on = new Date(expired_date);
        routineCommittee.expired_date = expired_on;
      }

      if (in_committee !== undefined) {
        routineCommittee.in_committee = in_committee;
      }

      await routineCommittee.save();

      res.json({
        message: "Routine committee updated successfully",
        data: routineCommittee,
      });
    } catch (error) {
      console.error("Error updating routine committee:", error);
      res.status(500).json({ error: "Failed to update routine committee" });
    }
  }
);

// Route to delete a routine committee
// DELETE /api/routine-committees/:coordinatorId
router.delete(
  "/routine-committees/:coordinatorId",
  async (req, res) => {
    try {
      const coordinatorId = req.params.coordinatorId;
      const deletedRoutineCommittee = await RoutineCommittee.findOneAndDelete({
        coordinatorId,
      });

      if (!deletedRoutineCommittee) {
        return res.status(404).json({ error: "Routine committee not found" });
      }

      res.json({ message: "Routine committee deleted successfully" });
    } catch (error) {
      console.error("Error deleting routine committee:", error);
      res.status(500).json({ error: "Failed to delete routine committee" });
    }
  }
);

module.exports = router;
