
const teacherService = require('../services/teacherService')

// teacherController.js
const register = async (req, res) => {
  try {
    const adminId = req.user.id; // ✅ from JWT (verifyAdmin)
    const teacher = await teacherService.registerTeacher({
      ...req.body,
      adminId,
    });
    res.status(201).json({ success: true, teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



// ✅ Login teacher
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { teacher, token } = await teacherService.loginTeacher(email, password);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    const { password: _, ...teacherData } = teacher;

    res.status(200).json({
      success: true,
      message: "Login successful",
      teacher: teacherData,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};





// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const result = await teacherService.loginTeacher(email, password);
//     res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     res.status(401).json({ success: false, message: error.message });
//   }
// };


const getAssignedTasks = async (req, res) => {
  try {
    const teacherId = req.user.id; // from JWT
    const tasks = await teacherService.getAssignedTasks(teacherId);
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update status of a task
 const updateTaskStatus = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { taskId } = req.params;
    const { status } = req.body; // "completed" or "in progress"

    const updatedTask = await teacherService.updateTaskStatus(teacherId, taskId, status);
    return res.json({ success: true, data: updatedTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




// mark attendance
// 🔹 Mark attendance
async function markAttendance(req, res) {
  try {
    const { presentStudents, department, year, classes, section } = req.body;
    const teacherId = req.user.id;

    const result = await teacherService.markAttendance({
      teacherId,
      presentStudents,
      department,
      year,
      classes,
      section,
    });

    res.json({
      success: true,
      message: "✅ Attendance (present + absent) marked successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
}



// ✅ Get all teachers (with filters)
const getTeachers = async (req, res) => {
  try {
    const { department, year, month, email, fromDate, toDate } = req.query;
    const filters = { department, year, month, email, fromDate, toDate };

    const teachers = await teacherService.getTeachers(filters);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// View teacher profile (admin)
const viewTeacher = async (req, res) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Edit teacher profile (admin)
const editTeacher = async (req, res) => {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body);
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete teacher (admin)
const removeTeacher = async (req, res) => {
  try {
    const result = await teacherService.deleteTeacher(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};








module.exports = { register, login, getAssignedTasks, updateTaskStatus, markAttendance, viewTeacher, editTeacher, removeTeacher, getTeachers};
