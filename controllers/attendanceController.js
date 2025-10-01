

// controllers/attendanceController.js
const AppDataSource = require("../config/dataSource");
const attendanceService = require("../services/attendanceService");

const attendanceController = {
  // POST /api/attendance/mark
  markAttendance: async (req, res) => {
    try {
      const { presentStudents, department, year, classes, camera, capturedImage } = req.body;

      if (!department || !year || !classes || !Array.isArray(presentStudents)) {
        return res.status(400).json({
          success: false,
          message: "Department, year, classes, and presentStudents array are required",
        });
      }

      // Call the modified service to mark attendance for the whole class
      const attendanceRecords = await attendanceService.markAttendanceForClass(
        presentStudents,
        {
          department,
          year,
          classes,
          camera,
          capturedImage,
          markedBy: req.user ? req.user.id : null,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Attendance marked successfully for the class",
        attendanceCount: attendanceRecords.length,
        presentCount: presentStudents.length,
      });
    } catch (err) {
      console.error("Error marking attendance:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while marking attendance",
      });
    }
  },


  // GET /api/attendance?date=&department=&year=&classes=
  getAttendance: async (req, res) => {
    try {
      const { date, studentId, department, year, classes } = req.query;

      const records = await attendanceService.getAttendance({
        date,
        studentId,
        department,
        year,
        classes
      });

      return res.status(200).json({
        success: true,
        records,
      });
    } catch (err) {
      console.error("Error fetching attendance:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching attendance",
      });
    }
  },

  // GET /api/attendance/encodings?department=&year=&classes=
  // ✅ Case-insensitive getStudentEncodings
  getStudentEncodings: async (req, res) => {
    try {
      const { department, year, classes } = req.query;
      const studentRepo = AppDataSource.getRepository("Student");

      let query = studentRepo
        .createQueryBuilder("student")
        .select([
          "student.id",
          "student.name",
          "student.face_encoding",
          "student.roll_number",
          "student.department",
          "student.year",
          "student.classes",
          "student.profile_image"
        ]);

      if (department) {
        query.andWhere("LOWER(student.department) = LOWER(:department)", {
          department,
        });
      }

      if (year) {
        query.andWhere("LOWER(student.year) = LOWER(:year)", { year });
      }

      if (classes) {
        query.andWhere("LOWER(student.classes) = LOWER(:classes)", { classes });
      }

      const students = await query.getMany();

      return res.json({ success: true, students });
    } catch (err) {
      console.error("Error fetching encodings:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student encodings",
      });
    }
  },
// controllers/attendanceController.js
markAttendanceByTimetable: async (req, res) => {
  try {
    const { timetableId } = req.params;
    const { presentStudents, camera, capturedImage, teacher } = req.body;

    if (!timetableId || !Array.isArray(presentStudents)) {
      return res.status(400).json({
        success: false,
        message: "timetableId and presentStudents are required",
      });
    }

    const records = await attendanceService.markAttendanceByTimetable(
      timetableId,
      presentStudents,
      {
        camera,
        capturedImage,
        markedBy: req.user ? req.user.id : null,
        teacher, // 👈 pass teacher to service
      }
    );

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully via timetable",
      attendanceCount: records.length,
      presentCount: presentStudents.length,
    });
  } catch (err) {
    console.error("Error in markAttendanceByTimetable:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
    });
  }
},



getSubjectEncodings: async (req, res) => {
  try {
    const { className, section, department, subject } = req.query;

    if (!className || !section || !department || !subject) {
      return res.status(400).json({ message: "className, section, department and subject are required" });
    }

    const result = await attendanceService.getSubjectEncodings(
      className,
      section,
      department,
      subject
    );

    if (!result) {
      return res.status(404).json({ message: "No records found for given filters" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching subject encodings:", error);
    res.status(500).json({ message: "Server error" });
  }
},




// Cam based Attandance API to get the data of perticuler time table 
 startAttendance : async (req, res) => {
  try {
    const { classId, section } = req.params;
    const data = await attendanceService.getAttendanceData(classId, section);
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Start Attendance Error:", err);
    res.status(500).json({ message: "Failed to fetch attendance data", error: err.message });
  }
},


};

module.exports = attendanceController;
