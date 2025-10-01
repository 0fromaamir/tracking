// services/adminService.js

const AppDataSource = require("../config/dataSource");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin")
const Student = require("../models/Student")
const Teacher = require("../models/Teacher")
const TeacherAssignment = require("../models/TeacherAssignment");


class AdminService {
  //  Create Admin
  async createAdmin(data) {
    const adminRepo = AppDataSource.getRepository("Admin");

    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.photo) {
      throw new Error("All fields (name, email, password, photo) are required.");
    }

    // Check if email already exists
    const existingAdmin = await adminRepo.findOne({ where: { email: data.email } });
    if (existingAdmin) {
      throw new Error("Email already exists. Please use another email.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    // Save admin
    const admin = adminRepo.create(data);
    return await adminRepo.save(admin);
  }

  //  Get All Admins
  async getAllAdmins() {
    const adminRepo = AppDataSource.getRepository("Admin");
    return await adminRepo.find({ relations: ["students"] });
  }

  //  Get Admin by ID
  async getAdminById(id) {
    const adminRepo = AppDataSource.getRepository("Admin");
    return await adminRepo.findOne({
      where: { id },
      relations: ["students"],
    });
  }

  //  Login Logic

  async adminLogin(email, password) {
    const adminRepo = AppDataSource.getRepository(Admin);
    const admin = await adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw new Error("Admin Not Found");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Generate token with role (1 day expiry)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" }  // 🔥 1 day
    );

    return { token, admin };
  }




  // ✅ Update Student
// services/adminService.js

async updateStudent(id, data) {
  const studentRepo = AppDataSource.getRepository(Student);
  const classRepo = AppDataSource.getRepository("Class");

  // 1️⃣ Find the student
  let student = await studentRepo.findOne({
    where: { id },
    relations: ["class"],
  });

  if (!student) return null;

  // 2️⃣ Handle class-related fields
  let classEntity = student.class; // default: current class

  if (data.classes || data.section || data.year) {
    classEntity = await classRepo.findOne({
      where: {
        name: data.classes || student.class?.name,
        section: data.section || student.class?.section,
        year: data.year || student.class?.year,
      },
    });

    // Create class if not exists
    if (!classEntity) {
      classEntity = classRepo.create({
        name: data.classes,
        section: data.section,
        year: data.year,
      });
      classEntity = await classRepo.save(classEntity);
    }
  }

  // 3️⃣ Remove class fields from student payload
  const { classes, section, year, ...studentData } = data;

  // 4️⃣ Update student fields and link class
  student = Object.assign(student, studentData, { class: classEntity });

  // 5️⃣ Save student
  await studentRepo.save(student);

  console.log("✅ Student updated:", student); // debugging

  return student;
}


// ✅ Delete Student safely
// ✅ Delete Student
async deleteStudent(id) {
  const studentRepo = AppDataSource.getRepository(Student);

  // Use delete() instead of remove() to avoid relation issues
  const result = await studentRepo.delete(id);

  // If no rows were affected, student not found
  if (result.affected === 0) return null;

  return { id }; // Return deleted student ID
}






  // --------------
  /**
   * ✅ Assign a teacher to a class (department + year + class + section)
   */
  async assignTeacher({ teacherEmail, department, year, classes, section, adminId }) {
    const teacherRepo = AppDataSource.getRepository(Teacher);
    const adminRepo = AppDataSource.getRepository(Admin);
    const assignmentRepo = AppDataSource.getRepository(TeacherAssignment);

    // 1. Find teacher
    const teacher = await teacherRepo.findOne({ where: { email: teacherEmail } });
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // 2. Find admin
    const admin = await adminRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new Error("Admin not found");
    }

    // 3. Check existing assignment
    const existing = await assignmentRepo.findOne({
      where: { teacher: { id: teacher.id }, department, year, classes, section },
      relations: ["teacher"]
    });

    if (existing) {
      throw new Error("This teacher is already assigned to this class");
    }

    // 4. Create new assignment with real entity
    const newAssignment = assignmentRepo.create({
      teacher,
      admin,   // 👈 actual admin entity, not just { id: adminId }
      department,
      year,
      classes,
      section
    });

    await assignmentRepo.save(newAssignment);

    return {
      success: true,
      message: "Teacher assigned successfully",
      assignment: newAssignment
    };
  }


  
  /**
 * ✅ Get teacher assignments with optional filters
 */
async getTeacherAssignments({ teacherId, department, year, classes, section }) {
  const assignmentRepo = AppDataSource.getRepository(TeacherAssignment);

  // Build query dynamically
  const qb = assignmentRepo
    .createQueryBuilder("assignment")
    .leftJoinAndSelect("assignment.teacher", "teacher")
    .leftJoinAndSelect("assignment.admin", "admin");

  if (teacherId) {
    qb.andWhere("teacher.id = :teacherId", { teacherId });
  }
  if (department) {
    qb.andWhere("assignment.department = :department", { department });
  }
  if (year) {
    qb.andWhere("assignment.year = :year", { year });
  }
  if (classes) {
    qb.andWhere("assignment.classes = :classes", { classes });
  }
  if (section) {
    qb.andWhere("assignment.section = :section", { section });
  }

  const results = await qb.getMany();

  return results;
}

}

module.exports = new AdminService();
