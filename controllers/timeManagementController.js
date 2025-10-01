const timeManagementService = require("../services/timeManagementService");

class TimeManagementController {

async create(req, res) {
  try {
    const adminId = req.user.id; // JWT middleware se aayega

    const result = await timeManagementService.createTimeManagement(req.body, adminId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create time management entry" 
    });
  }
}


  async getAll(req, res) {
    try {
      const result = await timeManagementService.getAllTimeManagement();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch records" });
    }
  }

  async getById(req, res) {
    try {
      const result = await timeManagementService.getTimeManagementById(req.params.id);
      if (!result) return res.status(404).json({ success: false, message: "Not found" });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch record" });
    }
  }

  async update(req, res) {
    try {
      const result = await timeManagementService.updateTimeManagement(req.params.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to update record" });
    }
  }

  async delete(req, res) {
    try {
      await timeManagementService.deleteTimeManagement(req.params.id);
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete record" });
    }
  }

async search(req, res) {
  try {
    const result = await timeManagementService.searchTimeManagement(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: error.message || "Search failed" });
  }
}

// controllers/timeManagementController.js
async searchWithoutDepartment(req, res) {
  try {
    const result = await timeManagementService.searchTimeManagementWithoutDepartment(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("SearchWithoutDepartment Error:", error);
    res.status(500).json({ success: false, message: error.message || "Search failed" });
  }
}




}

module.exports = new TimeManagementController();
