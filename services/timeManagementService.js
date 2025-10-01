const AppDataSource = require("../config/dataSource");
const TimeManagement = require("../models/TimeManagement");
const Class = require("../models/Class");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

class TimeManagementService {
  constructor() {
    this.repo = AppDataSource.getRepository(TimeManagement);
    this.classRepo = AppDataSource.getRepository(Class);
    this.teacherRepo = AppDataSource.getRepository(Teacher);
    this.adminRepo = AppDataSource.getRepository(Admin);
  }

  async createTimeManagement(data, adminId) {
    // Agar data array hai, multiple records ke liye
    if (Array.isArray(data)) {
      const savedRecords = [];

      for (const item of data) {
        const record = await this._createSingleTimeManagement(item, adminId);
        savedRecords.push(record);
      }

      return savedRecords;
    } else {
      // Single record
      return await this._createSingleTimeManagement(data, adminId);
    }
  }

  // Private helper function
  async _createSingleTimeManagement(data, adminId) {
    // 1️⃣ Resolve Class
    const classEntity = await this.classRepo.findOne({
      where: {
        name: data.class?.name,
        section: data.class?.section,
        year: data.class?.year
      }
    });
    if (!classEntity) throw new Error("Class not found");

    // 2️⃣ Resolve Teacher
    const teacherEntity = await this.teacherRepo.findOne({
      where: { email: data.teacher?.email }
    });
    if (!teacherEntity) throw new Error("Teacher not found");

    // 3️⃣ Admin directly from token
    const adminEntity = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!adminEntity) throw new Error("Admin not found");

    // 4️⃣ Save Record
    const newRecord = this.repo.create({
      subject: data.subject,
      start_time: data.start_time,
      end_time: data.end_time,
      day_of_week: data.day_of_week,
      class: classEntity,
      teacher: teacherEntity,
      admin: adminEntity
    });

    return await this.repo.save(newRecord);
  }


  async getAllTimeManagement() {
    return await this.repo.find({ relations: ["class", "teacher", "admin"] });
  }

  async getTimeManagementById(id) {
    return await this.repo.findOne({
      where: { id },
      relations: ["class", "teacher", "admin"],
    });
  }

  async updateTimeManagement(id, data) {
    await this.repo.update(id, data);
    return await this.getTimeManagementById(id);
  }

  async deleteTimeManagement(id) {
    return await this.repo.delete(id);
  }


// services/timeManagementService.js
async searchTimeManagement(query) {
  const { className, section, year, department } = query;

  let qb = this.repo
    .createQueryBuilder("timeManagement")
    .leftJoinAndSelect("timeManagement.class", "class")
    .leftJoinAndSelect("timeManagement.teacher", "teacher")
    .leftJoinAndSelect("timeManagement.admin", "admin");

  // Apply filters dynamically (case-insensitive)
  if (className) {
    qb = qb.andWhere("LOWER(class.name) = LOWER(:className)", { className });
    // For partial match use: qb.andWhere("class.name ILIKE :className", { className: `%${className}%` });
  }
  if (section) {
    qb = qb.andWhere("LOWER(class.section) = LOWER(:section)", { section });
  }
  if (year) {
    qb = qb.andWhere("LOWER(class.year) = LOWER(:year)", { year });
  }
  if (department) {
    qb = qb.andWhere("LOWER(teacher.department) = LOWER(:department)", { department });
  }

  return await qb.getMany();
}


// services/timeManagementService.js
async searchTimeManagementWithoutDepartment(query) {
  const { className, section, year } = query;

  let qb = this.repo
    .createQueryBuilder("timeManagement")
    .leftJoinAndSelect("timeManagement.class", "class")
    .leftJoinAndSelect("timeManagement.teacher", "teacher")
    .leftJoinAndSelect("timeManagement.admin", "admin");

  if (className) {
    qb = qb.andWhere("LOWER(class.name) = LOWER(:className)", { className });
  }
  if (section) {
    qb = qb.andWhere("LOWER(class.section) = LOWER(:section)", { section });
  }
  if (year) {
    qb = qb.andWhere("LOWER(class.year) = LOWER(:year)", { year });
  }

  return await qb.getMany();
}



}

module.exports = new TimeManagementService();
