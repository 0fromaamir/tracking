const cameraConfigurationService = require("../services/cameraConfigurationService.js");

exports.createCameraConfig = async (req, res) => {
  try {
    // Inject logged-in admin ID from token
    const data = { ...req.body, admin: req.user.id };

    const newConfig = await cameraConfigurationService.createCameraConfig(data);
    res.status(201).json(newConfig);
  } catch (error) {
    console.error("❌ Camera Config Error:", error);
    res.status(500).json({
      message: "Error creating camera config",
      error: error.message || error
    });
  }
};


exports.updateCameraConfig = async (req, res) => {
  try {
    const updatedConfig = await cameraConfigurationService.updateCameraConfig(req.params.id, req.body);
    if (!updatedConfig) return res.status(404).json({ message: "Camera config not found" });
    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating camera config", error: error.message });
  }
};


exports.getAllCameraConfigs = async (req, res) => {
  try {
    const configs = await cameraConfigurationService.getAllCameraConfigs();
    res.status(200).json(configs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching camera configs", error: error.message });
  }
};

exports.getCameraConfigById = async (req, res) => {
  try {
    const config = await cameraConfigurationService.getCameraConfigById(req.params.id);
    if (!config) return res.status(404).json({ message: "Camera config not found" });
    res.status(200).json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching camera config", error: error.message });
  }
};


exports.deleteCameraConfig = async (req, res) => {
  try {
    const deleted = await cameraConfigurationService.deleteCameraConfig(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Camera config not found" });
    res.status(200).json({ message: "Camera config deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting camera config", error: error.message });
  }
};

exports.searchTimeManagement = async (req, res) => {
  try {
    const { className, section, department } = req.body;

    if (!className || !section || !department) {
      return res.status(400).json({ message: "className, section, and department are required" });
    }

    const result = await cameraConfigurationService.searchTimeManagement(className, section, department);

    res.json(result);
  } catch (error) {
    console.error("Error searching time management:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// cameraCnfigurationController.js
exports.fetchAttendanceSetup = async (req, res) => {
  const { classId, slotId } = req.query;

  console.log("📩 [fetchAttendanceSetup] Incoming request:", { classId, slotId });

  if (!classId || !slotId) {
    console.warn("⚠️ Missing required params:", { classId, slotId });
    return res.status(400).json({ success: false, message: "Missing classId or slotId" });
  }

  try {
    const data = await cameraConfigurationService.getAttendanceSetupData(classId, slotId);

    if (!data) {
      console.warn("⚠️ No data returned from getAttendanceSetupData()");
      return res.status(404).json({ success: false, message: "No cameras or students found for this class/slot" });
    }

    console.log("✅ Attendance setup fetched successfully:", {
      cameraCount: data.cameras?.length || 0,
      studentCount: data.students?.length || 0,
      teacher: data.teacher?.name || "No teacher",
    });

    res.json({ success: true, ...data });
  } catch (err) {
    console.error("❌ [fetchAttendanceSetup] Server error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};








