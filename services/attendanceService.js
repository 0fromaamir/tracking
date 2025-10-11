// attendanceService.js

const AppDataSource = require("../config/dataSource");
const TimeManagement = require('../models/TimeManagement')
const Attendance = require('../models/Attendance')
const camera = require("../models/CameraConfiguration")

// ✅ Helper function (object ke bahar)
function safeParseEncoding(encoding) {
  if (!encoding) return null;
  if (typeof encoding === "object") return encoding; // already parsed
  try {
    if (encoding.startsWith("[") && encoding.endsWith("]")) {
      return JSON.parse(encoding);
    }
    return encoding; // fallback
  } catch (err) {
    console.error("Encoding parse error:", err, encoding);
    return null;
  }
}

const attendanceService = {

  async markAttendanceForClass(presentStudents = [], opts = {}) {
    const attendanceRepo = AppDataSource.getRepository("Attendance");
    const studentRepo = AppDataSource.getRepository("Student");

    if (!opts.department || !opts.year || !opts.classes) {
      throw new Error("Department, year, and classes are required");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allStudents = await studentRepo.find({
      where: {
        department: opts.department,
        year: opts.year,
        classes: opts.classes,
      },
    });

    const presentIds = new Set(presentStudents.map((s) => String(s.id)));

    const attendancePromises = allStudents.map(async (student) => {
      const existing = await attendanceRepo.createQueryBuilder("attendance")
        .where("attendance.studentId = :sid", { sid: student.id })
        .andWhere("attendance.date >= :today", { today: today.toISOString() })
        .getOne();

      if (existing) return existing;

      const status = presentIds.has(String(student.id)) ? "Present" : "Absent";

      const attendanceData = {
        student,
        status,
        captured_image: opts.capturedImage || null,
        camera: opts.camera || null,
        marked_by: opts.markedBy || null,
        date: new Date(),
        department: opts.department,
        year: opts.year,
        classes: opts.classes,
      };

      const attendance = attendanceRepo.create(attendanceData);
      await attendanceRepo.save(attendance);
      return attendance;
    });

    return Promise.all(attendancePromises);
  },

 // attendanceService.js
async getAttendance({ date = null, studentId = null, department = null, year = null, classId = null }) {
  const attendanceRepo = AppDataSource.getRepository("Attendance");

  const query = attendanceRepo.createQueryBuilder("attendance")
    .leftJoinAndSelect("attendance.student", "student")
    .leftJoinAndSelect("attendance.class", "class")
    .leftJoinAndSelect("attendance.teacher", "teacher");

  // ✅ Date filter
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    query.andWhere("attendance.date BETWEEN :start AND :end", {
      start: start.toISOString(),
      end: end.toISOString(),
    });
  }

  // ✅ Student filter
  if (studentId) {
    query.andWhere("student.id = :studentId", { studentId });
  }

  // ✅ Department filter (from student)
  if (department) {
    query.andWhere("student.department ILIKE :department", { department: `%${department}%` });
  }

  // ✅ Year filter (now check from class.year instead of student.year)
  if (year) {
    query.andWhere("class.year = :year", { year });
  }

  // ✅ Class filter (since student.classes is gone, use class.id or class.name+section)
  if (classId) {
    query.andWhere("class.id = :classId", { classId });
  }

  query.orderBy("attendance.date", "DESC");

  return query.getMany();
}
,

// attendanceService.js
async markAttendanceByTimetable(timetableId, presentStudents = [], opts = {}) {
  const timetableRepo = AppDataSource.getRepository("TimeManagement");
  const attendanceRepo = AppDataSource.getRepository("Attendance");

  const timetable = await timetableRepo.findOne({
    where: { id: timetableId },
    relations: ["class", "class.students", "teacher"],
  });

  if (!timetable) throw new Error("Timetable not found");

  const allStudents = timetable.class.students;
  const presentIds = new Set(presentStudents.map((s) => String(s.id)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ---- Students ----
  const attendancePromises = allStudents.map(async (student) => {
    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .where("attendance.studentId = :sid", { sid: student.id })
      .andWhere("attendance.subject = :subject", { subject: timetable.subject })
      .andWhere("attendance.date >= :today", { today: today.toISOString() })
      .getOne();

    if (existing) return existing;

    const status = presentIds.has(String(student.id)) ? "Present" : "Absent";

    const attendanceData = {
      student,
      subject: timetable.subject,
      timetable,
      class: timetable.class,
      teacher: timetable.teacher || null,
      status,
      captured_image: opts.capturedImage || null,
      camera: opts.camera || null,
      marked_by: opts.markedBy || null,
      date: new Date(),
    };

    const attendance = attendanceRepo.create(attendanceData);
    await attendanceRepo.save(attendance);
    return attendance;
  });

  const studentRecords = await Promise.all(attendancePromises);

  // ---- Teacher ----
  let teacherRecord = null;
  if (opts.teacher) {
    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .where("attendance.teacherId = :tid", { tid: opts.teacher })
      .andWhere("attendance.subject = :subject", { subject: timetable.subject })
      .andWhere("attendance.date >= :today", { today: today.toISOString() })
      .getOne();

    if (!existing) {
      const attendanceData = {
        teacher: { id: opts.teacher },
        subject: timetable.subject,
        timetable,
        class: timetable.class,
        status: "Present",
        captured_image: opts.capturedImage || null,
        camera: opts.camera || null,
        marked_by: opts.markedBy || null,
        date: new Date(),
      };

      teacherRecord = attendanceRepo.create(attendanceData);
      await attendanceRepo.save(teacherRecord);
    }
  }

  return teacherRecord ? [...studentRecords, teacherRecord] : studentRecords;
},



  // through this will recognise student and teacher 
  async getSubjectEncodings(className, section, department, subject) {
    const repo = AppDataSource.getRepository(TimeManagement);

    const timeManagement = await repo
      .createQueryBuilder("tm")
      .leftJoinAndSelect("tm.class", "class")
      .leftJoinAndSelect("tm.teacher", "teacher")
      .leftJoinAndSelect("class.students", "student")
      .where("LOWER(class.name) LIKE LOWER(:className)", { className: `%${className}%` })
      .andWhere("LOWER(class.section) LIKE LOWER(:section)", { section: `%${section}%` })
      .andWhere("LOWER(student.department) LIKE LOWER(:department)", { department: `%${department}%` })
      .andWhere("LOWER(tm.subject) LIKE LOWER(:subject)", { subject: `%${subject}%` })
      .getOne();

    if (!timeManagement) return null;

    return {
      teacher: {
        id: timeManagement.teacher.id,
        name: timeManagement.teacher.name,
        email: timeManagement.teacher.email,
        department: timeManagement.teacher.department,
        subject: timeManagement.subject,
        photo: timeManagement.teacher.photo || null, // ✅ add photo here
        encoding: safeParseEncoding(timeManagement.teacher.face_encoding) || [],
      },
      students: timeManagement.class.students.map(s => ({
        id: s.id,
        name: s.name,
        roll_number: s.roll_number,
        department: s.department,
        profile_image: s.profile_image || null, // ✅ add profile_image here
        encoding: safeParseEncoding(s.face_encoding) || [],
      }))
    };
  },



  // Cam Based Taking Attendance API through the TimeTable 
// Cam Based Taking Attendance API through the TimeTable
getAttendanceData: async (classId, section) => {
  const Camera = require("../models/CameraConfiguration"); // ✅ ensure Camera is defined
  const Student = require("../models/Student"); // ✅ ensure Student is defined
  const TimeManagement = require("../models/TimeManagement"); // ✅ ensure TimeManagement is defined

  // 1️⃣ Get camera for this class
  const camera = await AppDataSource.getRepository(Camera).findOne({
    where: { class: { id: classId, section } },
    relations: ["class", "admin"]
  });

  if (!camera) {
    return {
      camera: null,
      class: null,
      timetable: [],
      students: []
    }; // return empty object instead of throwing
  }

  // 2️⃣ Get TimeManagement records (subject + teacher)
  const timeTables = await AppDataSource.getRepository(TimeManagement).find({
    where: { class: { id: classId, section } },
    relations: ["teacher"]
  });

  // 3️⃣ Get all students in this class & section
  const students = await AppDataSource.getRepository(Student).find({
    where: { class: { id: classId, section } },
  });

  return {
    camera,
    class: camera.class || {},    // fallback if class is undefined
    timetable: timeTables || [],   // fallback
    students: students || []       // fallback
  };
},


};

module.exports = attendanceService;
