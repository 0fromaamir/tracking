



const AppDataSource = require("../config/dataSource");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const Class = require("../models/Class");
const classRepository = AppDataSource.getRepository(Class);

const studentRepository = AppDataSource.getRepository(Student);
const adminRepository = AppDataSource.getRepository(Admin);

// ---------------- Existing: Register Student ----------------
// ---------------- Existing: Register Student ----------------
const registerStudent = async (data) => {
  if (!data) throw new Error("Student data is required");

  const {
    name,
    roll_number,
    email,
    phone,
    department,
    year,
    classId,
    classes,
    section,
    profile_image,
    face_encoding,
    adminId
  } = data;

  if (!name || !roll_number || !email) {
    throw new Error("Name, roll number, and email are required");
  }

  // Check uniqueness
  const existingEmail = await studentRepository.findOne({ where: { email } });
  const existingRoll = await studentRepository.findOne({ where: { roll_number } });
  if (existingEmail || existingRoll) {
    throw new Error("Email or roll number already exists");
  }

  const admin = await adminRepository.findOne({ where: { id: adminId } });
  if (!admin) throw new Error("Invalid admin ID");

  // Handle class assignment / creation
  let studentClass = null;
  if (classId) {
    studentClass = await classRepository.findOne({ where: { id: classId } });
  } else if (classes && section) {
    studentClass = await classRepository.findOne({
      where: { name: classes, section }
    });

    // 🔹 Create class if it doesn't exist
    if (!studentClass) {
      studentClass = classRepository.create({
        name: classes,
        section,
        year: year || null
      });
      studentClass = await classRepository.save(studentClass);
    }
  }

  // Normalize face encoding → always array
  let processedEncoding = null;
  if (face_encoding) {
    if (Array.isArray(face_encoding)) {
      processedEncoding = face_encoding.map((v) => parseFloat(v));
    } else if (typeof face_encoding === "string") {
      try {
        processedEncoding = JSON.parse(face_encoding);
      } catch {
        processedEncoding = face_encoding
          .replace(/[{}\[\]"]/g, "")
          .split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
      }
    } else if (typeof face_encoding === "object") {
      processedEncoding = Object.values(face_encoding).map((v) => parseFloat(v));
    }
  }

  const student = studentRepository.create({
    name,
    roll_number,
    email,
    phone,
    department,
    year,
    profile_image,
    face_encoding: processedEncoding || null,
    admin,
    class: studentClass
  });

  return await studentRepository.save(student);
};







// ---------------- New: Get All Students ----------------
const getAllStudents = async () => {
  return await studentRepository.find({
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
      "profile_image"
    ]
  });
};

// ---------------- New: Get Student Encodings ----------------
const getStudentEncodings = async () => {
  return await studentRepository.find({
    select: ["id", "name", "face_encoding"]
  });
};


//------filter-------------

// ✅ New Service: Filtered Students
const getFilteredStudents = async (filters) => {
  const { rollNumber, department, phone, email, section, year, month, date } = filters;
  const studentRepo = AppDataSource.getRepository(Student);

  let query = studentRepo
    .createQueryBuilder("student")
    .leftJoinAndSelect("student.class", "class");

  if (rollNumber) {
    query.andWhere("student.roll_number ILIKE :rollNumber", { rollNumber: `%${rollNumber}%` });
  }
  if (department) {
    query.andWhere("student.department ILIKE :department", { department: `%${department}%` });
  }
  if (phone) {
    query.andWhere("student.phone ILIKE :phone", { phone: `%${phone}%` });
  }
  if (email) {
    query.andWhere("student.email ILIKE :email", { email: `%${email}%` });
  }
  if (section) {
    query.andWhere("class.section ILIKE :section", { section: `%${section}%` });
  }
  if (year) {
    query.andWhere("class.year ILIKE :year", { year: `%${year}%` });
  }
  if (month) {
    query.andWhere("EXTRACT(MONTH FROM student.created_at) = :month", { month });
  }
  if (date) {
    query.andWhere("DATE(student.created_at) = :date", { date });
  }

  return await query
    .select([
      "student.id",
      "student.name",
      "student.roll_number",
      "student.department",
      "student.phone",
      "student.email",
      "student.profile_image",
      "student.created_at",
      "class.id",
      "class.name",
      "class.section",
      "class.year"
    ])
    .getMany();
};



const getStudentCount = async () => {
  try {
    const rows = await AppDataSource.query("SELECT COUNT(*) AS total FROM students");
    if (!rows || rows.length === 0) {
      throw new Error("No data returned from query");
    }
    return rows[0].total;  // rows is an array, so rows[0] exists
  } catch (error) {
    console.error("Error in getStudentCount:", error);
    throw error;
  }
};


async function findStudentById(id) {
  const studentRepo = AppDataSource.getRepository(Student);
  const student = await studentRepo.findOne({
    where: { id },
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
      "face_encoding",
    ],
  });
  return student;
}


module.exports = {
  
  registerStudent,
  getAllStudents,
  getStudentEncodings,
  getFilteredStudents,
  getStudentCount,
  findStudentById,
  
};
