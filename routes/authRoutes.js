// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Coordinator = require("../models/Coordinator");
const {
  generateToken,
  authenticateUser,
  authorizeRole,
  PROGRAM_CHAIR_USER,
} = require("../utils/auth");
const { ROLES } = require("../models/Role");

// Middleware to check if the user is the program chair
const isProgramChair = (req, res, next) => {
    // Check if the program chair is logged in
    if (req.session.isProgramChairLoggedIn) {
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
};

// Middleware to check if the user is a coordinator
const isCoordinator = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the coordinator by email
    const coordinator = await Coordinator.findOne({ email });

    if (!coordinator) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the provided password matches the coordinator's password
    const isPasswordValid = await bcrypt.compare(
      password,
      coordinator.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { role: "coordinator" };
    next();
  } catch (error) {
    console.error("Error authenticating coordinator:", error);
    res.status(500).json({ error: "Failed to authenticate coordinator" });
  }
};

// Route for user signup (only for students and faculty)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the role is valid and not coordinator or program chair
    if (
      !Object.values(ROLES)
        .map((r) => r.name)
        .includes(role) ||
      role === "coordinator" ||
      role === "programChair"
    ) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ name, email, password, role });
    const savedUser = await newUser.save();

    res.json({ message: "User created successfully", data: savedUser });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Failed to sign up" });
  }
});

// Route for user login (including students and faculty)
router.post("/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
  
      // Check if the user is the program chair
      if (
        email === "programchair@iit.du.ac.bd" &&
        password === "programchairPassword"
      ) {
        req.session.isProgramChairLoggedIn = true;
        return res.json({ message: "Program chair logged in successfully" });
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
  
      // Check the user's role
      const userRole = role.toLowerCase();
      if (userRole !== "student" && userRole !== "faculty") {
        return res.status(400).json({ error: "Invalid role" });
      }
  
      // Check if the program chair is logged in
      if (req.session.isProgramChairLoggedIn) {
        res.json({ message: "Login successful", data: user });
      } else {
        res.json({ message: "Login successful", data: user });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });
// Route for user logout
router.post("/logout", async (req, res) => {
  try {
    // Invalidate the JWT token or remove the session data
    // Here, we simply return a success message
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
});

// Route for creating a new coordinator (accessible only to program chair)
router.post("/coordinators", isProgramChair, async (req, res) => {
  try {
    const { name, email, password, batchNo } = req.body;

    // Check if the coordinator already exists
    const existingCoordinator = await User.findOne({ email });
    if (existingCoordinator) {
      return res.status(400).json({ error: "Coordinator already exists" });
    }

    // Create a new coordinator
    const newCoordinator = new User({
      name,
      email,
      password,
      role: ROLES.coordinator.name,
    });
    const savedCoordinator = await newCoordinator.save();

    // Create a new Coordinator document
    const coordinatorData = new Coordinator({
      coordinatorId: savedCoordinator._id,
      coordinatorName: name,
      email,
      batchNo,
      password,
    });
    await coordinatorData.save();

    res.json({
      message: "Coordinator created successfully",
      data: savedCoordinator,
    });
  } catch (error) {
    console.error("Error creating coordinator:", error);
    res.status(500).json({ error: "Failed to create coordinator" });
  }
});
module.exports = router;
