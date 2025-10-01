



// routes/teacherRoutes.js
const express = require("express");
const teacherController = require("../controllers/teacherController");
const { verifyToken, verifyTeacher, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register",verifyToken, verifyAdmin, teacherController.register);

router.post("/login", teacherController.login);

// Teacher routes
router.get("/tasks", verifyToken, verifyTeacher, teacherController.getAssignedTasks); // Get all tasks assigned to teacher
router.patch("/tasks/:taskId", verifyToken, verifyTeacher, teacherController.updateTaskStatus); // Update task status

// ✅ Mark attendance via face recognition
router.post("/attendance/mark", verifyToken, verifyTeacher, teacherController.markAttendance);






// ✅ Admin: Get teacher list with filters (department, year, month, email, date)
router.get("/admin/teachers", verifyToken, verifyAdmin, teacherController.getTeachers);

// Admin view teacher profile
router.get("/admin/teacher/:id",verifyToken,verifyAdmin, teacherController.viewTeacher);

// Admin edit teacher profile
router.put("/admin/teacher/:id",verifyToken, verifyAdmin, teacherController.editTeacher);

// Admin delete teacher
router.delete("/admin/teacher/:id",verifyToken, verifyAdmin, teacherController.removeTeacher);



module.exports = router;
