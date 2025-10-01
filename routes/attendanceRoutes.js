// routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { verifyToken, verifyAdmin, verifyTeacher } = require("../middleware/authMiddleware");

// Mark attendance
router.post("/mark", verifyToken, verifyAdmin, attendanceController.markAttendance);

// Get attendance records (admin only)
router.get("/", verifyToken, verifyAdmin, attendanceController.getAttendance);
router.get("/view-attendance-teacher", verifyToken, verifyTeacher, attendanceController.getAttendance);

// Fetch student encodings for face recognition
router.get("/encodings", verifyToken, verifyAdmin, attendanceController.getStudentEncodings);


// routes/attendanceRoutes.js
router.post("/mark-by-timetable/:timetableId", verifyToken, verifyAdmin, attendanceController.markAttendanceByTimetable);


// routes/attendanceRoutes.js
router.get("/subject-encodings", verifyToken, verifyAdmin, attendanceController.getSubjectEncodings);

// Cam Based Taking Attendance API through the Time Table
router.get('/start/:classId/:section',verifyToken, verifyAdmin, attendanceController.startAttendance);


module.exports = router;
