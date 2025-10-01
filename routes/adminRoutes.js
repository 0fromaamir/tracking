

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");


//  Admin Routes
router.post("/", adminController.createAdmin);        // Create new admin
router.get("/", adminController.getAllAdmins);       // Get all admins
router.get("/:id", adminController.getAdminById);    // Get admin by ID
router.post("/login", adminController.adminLogin);   // Admin login

router.put("/update-student/:id", adminController.updateStudent);
router.delete("/delete-student/:id", adminController.deleteStudent);

// ✅ Create an assignment (assign teacher to dept/year/class/section)
router.post("/assignments", adminController.createTeacherAssignment);

// ✅ List assignments (optionally filter by teacherId/department/year/classes/section)
router.get("/assignments", adminController.getTeacherAssignments);

// ✅ Remove an assignment by id
router.delete("/assignments/:id", adminController.deleteTeacherAssignment);

module.exports = router;
