
// services/teacherService.js
const AppDataSource = require("../config/dataSource");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const TeacherAssignment = require("../models/TeacherAssignment");
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// const { loginTeacher } = require("../controllers/teacherController");

// teacherService.js
// teacherService.js

// ✅ Register Teacher
const registerTeacher = async (data) => {
  const {
    name,
    email,
    phone,
    department,
    designation,
    qualification,
    photo,
    joining_date,
    password,
    face_encoding,
    adminId,
  } = data;

  const teacherRepository = AppDataSource.getRepository(Teacher);
  const adminRepository = AppDataSource.getRepository("Admin");

  const existing = await teacherRepository.findOne({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔹 Normalize encoding → always array
  let processedEncoding = null;
  if (face_encoding) {
    if (Array.isArray(face_encoding)) {
      processedEncoding = face_encoding.map((v) => parseFloat(v));
    } else if (typeof face_encoding === "string") {
      try {
        processedEncoding = JSON.parse(face_encoding);
      } catch {
        throw new Error("Invalid face_encoding format");
      }
    }
  }

  let adminEntity = null;
  if (adminId) {
    adminEntity = await adminRepository.findOne({ where: { id: adminId } });
    if (!adminEntity) throw new Error("Admin not found");
  }

  const teacher = teacherRepository.create({
    name,
    email,
    phone,
    department,
    designation,
    qualification,
    photo,
    joining_date,
    password: hashedPassword,
    face_encoding: processedEncoding || null,   // ✅ store as JSONB array
    admin: adminEntity,
  });

  await teacherRepository.save(teacher);
  return teacher;
};








// ✅ Login teacher
async function loginTeacher(email, password) {
  const teacherRepository = AppDataSource.getRepository(Teacher);

  const teacher = await teacherRepository.findOne({ where: { email } });
  if (!teacher) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: teacher.id, email: teacher.email, role: "teacher" },
    process.env.JWT_SECRET || "SECRET_KEY",
    { expiresIn: "1d" }
  );

  return { teacher, token };
}


// // login API 
// const loginTeacher = async (email, password) => {
//   const teacherRepository = AppDataSource.getRepository(Teacher);

//   const teacher = await teacherRepository.findOne({ where: { email } });
//   if (!teacher) throw new Error("Invalid credentials");

//   const isMatch = await bcrypt.compare(password, teacher.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   // Generate JWT
//   const token = jwt.sign(
//     { id: teacher.id, email: teacher.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   return { teacher, token };
// };


// ✅ Get all tasks assigned to a teacher

// ✅ Get all tasks assigned to a teacher
// const teacherAssignmentRepository = AppDataSource.getRepository(TeacherAssignment);

async function getAssignedTasks(teacherId) {
  const teacherAssignmentRepository = AppDataSource.getRepository(TeacherAssignment);

  const tasks = await teacherAssignmentRepository.find({
    where: { teacher: { id: teacherId } },
    relations: ["teacher", "admin"], // only valid relations
    order: { id: "DESC" } // optional: latest tasks first
  });

  return tasks;
}


// ✅ Update the status of a task
async function updateTaskStatus(teacherId, taskId, status) {
  const taskRepository = AppDataSource.getRepository(TeacherAssignment);

  const task = await taskRepository.findOne({
    where: { id: taskId, teacher: { id: teacherId } },
    relations: ["teacher", "admin"], // only valid relations
  });

  if (!task) throw new Error("Task not found or not assigned to you");

  task.status = status; // if you have a status column
  await taskRepository.save(task);
  return task;
}


//  API Mark Attendance By Teacher

// 🔹 Mark attendance for multiple students
// async function markAttendance({ teacherId, presentStudents, department, year, classes, section }) {
//   const attendanceRepo = AppDataSource.getRepository("Attendance");
//   const studentRepo = AppDataSource.getRepository("Student");
//   const teacherRepo = AppDataSource.getRepository("Teacher");

//   // Fetch teacher entity
//   const teacher = await teacherRepo.findOne({ where: { id: teacherId } });
//   if (!teacher) throw new Error("Teacher not found");

//   // Fetch all students for this class
//   const allStudents = await studentRepo.find({
//     where: { department, year, classes, section },
//   });

//   const presentIds = presentStudents.map((s) => s.id);
//   const results = [];

//   for (const student of allStudents) {
//     const status = presentIds.includes(student.id) ? "present" : "absent";

//     const attendance = attendanceRepo.create({
//       date: new Date(),
//       status,
//       student,
//       teacher,
//     });

//     const saved = await attendanceRepo.save(attendance);
//     results.push(saved);
//   }

//   return results;
// }


// ✅ Get teacher by ID (for admin view)
// services/teacherService.js
const getTeacherById = async (id) => {
  const teacherRepository = AppDataSource.getRepository(Teacher);

  const teacher = await teacherRepository.findOne({ where: { id } });
  if (!teacher) throw new Error("Teacher not found");

  return teacher;
};


// ✅ Get list of teachers with optional filters
async function getTeachers(filters) {
  const teacherRepo = AppDataSource.getRepository(Teacher);
  let query = teacherRepo.createQueryBuilder("teacher");

  if (filters.department) {
    query = query.andWhere("teacher.department = :department", { department: filters.department });
  }

  if (filters.email) {
    query = query.andWhere("teacher.email ILIKE :email", { email: `%${filters.email}%` });
  }

  if (filters.year) {
    query = query.andWhere("EXTRACT(YEAR FROM teacher.joining_date) = :year", { year: filters.year });
  }

  if (filters.month) {
    query = query.andWhere("EXTRACT(MONTH FROM teacher.joining_date) = :month", { month: filters.month });
  }

  if (filters.fromDate && filters.toDate) {
    query = query.andWhere("teacher.joining_date BETWEEN :from AND :to", {
      from: filters.fromDate,
      to: filters.toDate,
    });
  }

  // ✅ Ascending order (oldest → latest)
  query = query.orderBy("teacher.id", "ASC");

  return await query.getMany();
}




// ✅ Update teacher info (admin edit)
async function updateTeacher(teacherId, data) {
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const teacher = await teacherRepo.findOne({ where: { id: teacherId } });
  if (!teacher) throw new Error("Teacher not found");

  // Update fields
  Object.assign(teacher, data);

  await teacherRepo.save(teacher);
  return teacher;
}

// ✅ Delete teacher (admin)
async function deleteTeacher(teacherId) {
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const teacher = await teacherRepo.findOne({ where: { id: teacherId } });
  if (!teacher) throw new Error("Teacher not found");

  await teacherRepo.remove(teacher);
  return { message: "Teacher deleted successfully" };
}






module.exports = { registerTeacher, getAssignedTasks, updateTaskStatus, loginTeacher, getTeacherById, updateTeacher, deleteTeacher, getTeachers };
