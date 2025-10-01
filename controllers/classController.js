const classService = require("../services/classService");

class ClassController {
  async create(req, res) {
    try {
      const result = await classService.createClass(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error("❌ Error creating class:", error);
      res.status(500).json({ success: false, message: "Failed to create class" });
    }
  }

  async getAll(req, res) {
    try {
      const result = await classService.getAllClasses();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      res.status(500).json({ success: false, message: "Failed to fetch classes" });
    }
  }

  async getById(req, res) {
    try {
      const result = await classService.getClassById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("❌ Error fetching class:", error);
      res.status(500).json({ success: false, message: "Failed to fetch class" });
    }
  }

  // ✅ New: Get students + teachers encodings for class
  async getEncodings(req, res) {
    try {
      const result = await classService.getClassEncodings(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("❌ Error fetching class encodings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch encodings" });
    }
  }

async update(req, res) {
  try {
    const updatedStudent = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedStudent });
  } catch (err) {
    console.error("❌ Error updating student:", err);
    res.status(500).json({ success: false, message: "Failed to update student" });
  }
}


  async delete(req, res) {
    try {
      await classService.deleteClass(req.params.id);
      res.status(200).json({ success: true, message: "Class deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting class:", error);
      res.status(500).json({ success: false, message: "Failed to delete class" });
    }
  }
}

module.exports = new ClassController();
