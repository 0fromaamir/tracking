const express = require("express");
const router = express.Router();
const cameraConfigurationController = require("../controllers/cameraConfigurationController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// 🧠 Debug middleware (optional but helpful)
router.use((req, res, next) => {
  console.log("📩 [CameraConfig Route Hit]", req.method, req.originalUrl);
  next();
});

// ----------------------------
// 🎥 Camera Configuration Routes (ordered correctly)
// ----------------------------

// 1️⃣ Create new camera config
router.post("/", verifyToken, verifyAdmin, cameraConfigurationController.createCameraConfig);

// 2️⃣ Update existing camera config
router.put("/:id", verifyToken, verifyAdmin, cameraConfigurationController.updateCameraConfig);

// 3️⃣ Search TimeManagement by class/section/department
router.post("/search", verifyToken, verifyAdmin, cameraConfigurationController.searchTimeManagement);

// 4️⃣ Fetch attendance setup (must come BEFORE :id)
router.get("/attendance/setup", cameraConfigurationController.fetchAttendanceSetup);

// 5️⃣ Get single camera config by ID
router.get("/:id", verifyToken, verifyAdmin, cameraConfigurationController.getCameraConfigById);

// 6️⃣ Delete camera config
router.delete("/:id", verifyToken, verifyAdmin, cameraConfigurationController.deleteCameraConfig);

// 7️⃣ Get all camera configs (keep last)
router.get("/", verifyToken, verifyAdmin, cameraConfigurationController.getAllCameraConfigs);

// ----------------------------
module.exports = router;
