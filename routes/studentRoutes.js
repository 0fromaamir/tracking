


const express = require('express');
const {
  registerStudent,
  getAllStudents,
  getStudentEncodings,
  getFilteredStudents,
  fetchStudentCount,
  getStudentById,
} = require("../controllers/studentController");


const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Existing route (unchanged)
router.post("/register", verifyToken, verifyAdmin, registerStudent);

// ✅ New routes
router.get("/", verifyToken, verifyAdmin, getAllStudents); // Get all students
router.get("/encodings", verifyToken, verifyAdmin, getStudentEncodings); // Get face encodings

// ✅ New route for filtering
router.get("/filter", verifyToken, verifyAdmin, getFilteredStudents);

// to count how mainy students registered
router.get("/count",verifyToken, verifyAdmin, fetchStudentCount);

// ✅ New Route
router.get("/:id", verifyToken, verifyAdmin, getStudentById);



module.exports = router;
