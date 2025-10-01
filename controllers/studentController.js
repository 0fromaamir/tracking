


const AppDataSource = require("../config/dataSource");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const studentService = require("../services/studentService");
// import { getStudentCount } from "../services/attendanceService";


// ---------------- Existing Function ----------------
const registerStudent = async (req, res) => {
  try {
    const adminId = req.user.id; // logged-in admin
    const payload = req.body;

    // Bulk insert (array of students)
    if (Array.isArray(payload)) {
      const results = [];
      for (const data of payload) {
        const student = await studentService.registerStudent({
          ...data,
          adminId
        });
        results.push(student);
      }
      return res.status(201).json({ success: true, students: results });
    }

    // Single insert
    const student = await studentService.registerStudent({
      ...payload,
      adminId
    });

    return res.status(201).json({ success: true, student });
  } catch (err) {
    console.error("Error registering student:", err);

    // Handle class creation conflicts gracefully
    if (err.message.includes("Class")) {
      return res.status(400).json({ success: false, message: err.message });
    }

    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};





// ---------------- New Function: Get All Students ----------------
const getAllStudents = async (req, res) => {
  try {
    const students = await AppDataSource.getRepository(Student).find({
      relations: ["admin"],
      select: [
        "id",
        "name",
        "roll_number",
        "email",
        "phone",
        "department",
        "year",
        "section",
        "classes",
        "profile_image",
      ]
    });

    res.status(200).json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- New Function: Get Student Encodings ----------------

const getStudentEncodings = async (req, res) => {
  try {
    const students = await AppDataSource.getRepository(Student).find({
      select: ["id", "name", "roll_number", "department", "year", "section", "classes", "profile_image", "face_encoding"]
    });
    res.json(students);
  } catch (err) {
    console.error("Error fetching encodings:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



// ------------filter-----------
// ✅ New Controller for Filtering
const getFilteredStudents = async (req, res) =>  {
  try {
    const filters = req.query; // rollNumber, year, department, section, phone, email, month, date
    const students = await studentService.getFilteredStudents(filters);
    res.json(students);
  } catch (error) {
    console.error("Error fetching filtered students:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ------------------------------------


// controllers/studentController.js


 const fetchStudentCount = async (req, res) => {
  try {
    const count = await studentService.getStudentCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching student count:", error);
    res.status(500).json({ error: "Failed to fetch student count" });
  }
};



async function getStudentById(req, res) {
  try {
    const { id } = req.params;

    const student = await studentService.findStudentById(parseInt(id));

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = { registerStudent, getAllStudents, getStudentEncodings,getFilteredStudents, fetchStudentCount,getStudentById }; 
