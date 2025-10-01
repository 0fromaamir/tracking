const express = require("express");
const router = express.Router();
const cameraConfigurationController = require("../controllers/cameraConfigurationController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// CRUD Routes
router.post("/", verifyToken, verifyAdmin, cameraConfigurationController.createCameraConfig);


// 🔎 Search TimeManagement by class, section, department
router.post("/search", verifyToken, verifyAdmin, cameraConfigurationController.searchTimeManagement);

// Fetch attendance setup (camera, teacher, students)
router.get("/attendance/setup", cameraConfigurationController.fetchAttendanceSetup);

router.get("/", verifyToken, verifyAdmin, cameraConfigurationController.getAllCameraConfigs);
router.get("/:id", verifyToken, verifyAdmin, cameraConfigurationController.getCameraConfigById);
router.put("/:id", verifyToken, verifyAdmin, cameraConfigurationController.updateCameraConfig);
router.delete("/:id", verifyToken, verifyAdmin, cameraConfigurationController.deleteCameraConfig);


module.exports = router;
