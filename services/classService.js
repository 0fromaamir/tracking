const AppDataSource = require("../config/dataSource");
const ClassEntity = require("../models/Class");
const StudentEntity = require("../models/Student");
const TimeManagementEntity = require("../models/TimeManagement");

class ClassService {
  constructor() {
    this.repo = AppDataSource.getRepository(ClassEntity);
  }

  async createClass(data) {
    const newClass = this.repo.create(data);
    return await this.repo.save(newClass);
  }

  async getAllClasses() {
    return await this.repo.find({ relations: ["students"] });
  }

  async getClassById(id) {
    return await this.repo.findOne({
      where: { id },
      relations: ["students"],
    });
  }

// studentService.js
// studentService.js
async updateStudent(id, data) {
  const studentRepo = AppDataSource.getRepository(StudentEntity);
  const classRepo = AppDataSource.getRepository(ClassEntity);

  let classEntity = null;

  // Handle class fields
  if (data.classes || data.section || data.year) {
    classEntity = await classRepo.findOne({
      where: {
        name: data.classes,
        section: data.section,
        year: data.year,
      },
    });

    // Create class if it doesn't exist
    if (!classEntity) {
      classEntity = await classRepo.save({
        name: data.classes,
        section: data.section,
        year: data.year,
      });
    }
  }

  // Remove class fields from student payload
  const { classes, section, year, ...studentData } = data;

  // Save student with linked class
  return await studentRepo.save({
    id,
    ...studentData,
    class: classEntity,
  });
}



  async deleteClass(id) {
    return await this.repo.delete(id);
  }

  // ✅ New: Fetch encodings for students + teachers of a class
  async getClassEncodings(classId) {
    const classData = await this.repo.findOne({
      where: { id: classId },
      relations: ["students"],
    });

    if (!classData) return null;

    const studentRepo = AppDataSource.getRepository(StudentEntity);
    const timeRepo = AppDataSource.getRepository(TimeManagementEntity);

    // Fetch students with face encodings
    const students = await studentRepo.find({
      where: { class: { id: classId } },
      select: ["id", "name", "roll_number", "face_encoding", "profile_image"],
    });

    // Fetch teachers via timetable
    const schedules = await timeRepo.find({
      where: { class: { id: classId } },
      relations: ["teacher"],
    });

    const teachers = schedules.map((s) => ({
      id: s.teacher.id,
      name: s.teacher.name,
      email: s.teacher.email,
      face_encoding: s.teacher.face_encoding,
      photo: s.teacher.photo,
    }));

    return {
      class: {
        id: classData.id,
        name: classData.name,
        section: classData.section,
      },
      students,
      teachers,
    };
  }
}

module.exports = new ClassService();
