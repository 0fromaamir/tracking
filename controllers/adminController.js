

const adminService = require("../services/adminService");
const Student = require("../models/Student")

class AdminController {
  //  Create Admin
  async createAdmin(req, res) {
    try {
      const admin = await adminService.createAdmin(req.body);
      res.status(201).json({
        success: true,
        message: " Admin created successfully",
        data: admin,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Failed to create admin",
      });
    }
  }

  // Get All Admins
  async getAllAdmins(req, res) {
    try {
      const admins = await adminService.getAllAdmins();
      res.status(200).json({
        success: true,
        count: admins.length,
        data: admins,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  }

  //  Get Admin By ID
  async getAdminById(req, res) {
    try {
      const admin = await adminService.getAdminById(req.params.id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
      res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  }

  // Admin Login

  // async adminLogin(req, res) {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Email and password are required",
  //       });
  //     }

  //     const result = await adminService.adminLogin(email, password);

  //     // Remove password before sending admin object
  //     const { password: _, ...adminData } = result.admin;

  //     // ✅ Set token in httpOnly cookie
  //     res.cookie('token', result.token, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'lax',
  //       maxAge: 36000000, // 1 hour
  //     });

  //     res.status(200).json({
  //       success: true,
  //       message: "✅ Login successful",
  //       admin: adminData, // includes role
  //     });
  //   } catch (err) {
  //     res.status(400).json({
  //       success: false,
  //       message: err.message || "Login failed",
  //     });
  //   }
  // }



// adminController.js

  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await adminService.adminLogin(email, password);

      // Remove password before sending admin object
      const { password: _, ...adminData } = result.admin;

      // ✅ Set token in httpOnly cookie (1 day expiry)
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // ✅ ALSO send token in JSON for frontend access
      res.status(200).json({
        success: true,
        message: "✅ Login successful",
        admin: adminData,
        token: result.token,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Login failed",
      });
    }
  }




// API Student Update 
 // controllers/adminController.js

async updateStudent(req, res) {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Call adminService.updateStudent which now handles class linking
    const student = await adminService.updateStudent(parseInt(id), updatedData);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("❌ updateStudent error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}


// API Delete Student
async deleteStudent(req, res) {
  try {
    const { id } = req.params;

    const student = await adminService.deleteStudent(parseInt(id));

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}

  // API create Teacher Assignmenet

  createTeacherAssignment = async (req, res) => {
    try {
      const {
        teacherEmail,      // preferred
        teacherId,         // or this, if you want to use id
        adminId,           // pass if you don’t have auth middleware; else derive from token
        department,
        year,
        classes,           // IMPORTANT: matches Student.classes column
        section
      } = req.body;

      if ((!teacherEmail && !teacherId) || !department || !year || !classes || !section) {
        return res.status(400).json({
          success: false,
          message: "teacherEmail/teacherId, department, year, classes, section are required"
        });
      }

      const assignment = await adminService.assignTeacher({
        teacherEmail,
        teacherId,
        adminId,
        department,
        year,
        classes,
        section
      });

      return res.status(201).json({
        success: true,
        message: "Teacher assigned successfully",
        data: assignment
      });
    } catch (err) {
      console.error("createTeacherAssignment error:", err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Server error"
      });
    }
  };


//  API get Teacher Assignmenet
  getTeacherAssignments = async (req, res) => {
    try {
      const filters = {
        teacherId: req.query.teacherId ? Number(req.query.teacherId) : undefined,
        department: req.query.department,
        year: req.query.year,
        classes: req.query.classes,
        section: req.query.section
      };

      const list = await adminService.getTeacherAssignments(filters);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      console.error("getTeacherAssignments error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  deleteTeacherAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      await adminService.deleteTeacherAssignment(Number(id));
      return res.status(200).json({ success: true, message: "Assignment removed" });
    } catch (err) {
      console.error("deleteTeacherAssignment error:", err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Server error"
      });
    }
  };







}

module.exports = new AdminController();
