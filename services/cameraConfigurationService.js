const AppDataSource = require("../config/dataSource"); // TypeORM datasource
const CameraConfiguration = require("../models/CameraConfiguration");
const Class = require("../models/Class");
const TimeManagement = require("../models/TimeManagement");

const cameraRepo = AppDataSource.getRepository("CameraConfiguration");
const classRepo = AppDataSource.getRepository("Class");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

// cameraConfigurationService.js
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


// const pingCamera = async (ip) => {
//   try {
//     // Attempt to fetch camera status
//     const response = await fetch(`http://${ip}/status`, { method: "GET", timeout: 3000 });
//     return response.ok;
//   } catch (err) {
//     console.error(`Camera ping failed for IP ${ip}:`, err.message);
//     return false;
//   }
// };

// Remove ping from createCameraConfig
exports.createCameraConfig = async (data) => {
  let classId = data.classId;

  if (typeof data.class === "string") {
    const classEntity = await classRepo
      .createQueryBuilder("class")
      .where("LOWER(class.name) = LOWER(:name)", { name: data.class })
      .andWhere(data.section ? "LOWER(class.section) = LOWER(:section)" : "1=1", { section: data.section || "" })
      .getOne();

    if (!classEntity) {
      throw new Error(`Class "${data.class}${data.section ? ' - ' + data.section : ''}" not found`);
    }

    classId = classEntity.id;
    data.year = classEntity.year; // year from class
  }

  const config = cameraRepo.create({
    camera_name: data.camera_name,
    ip_address: data.ip_address,
    status: data.status || "active",
    year: data.year,
    class: { id: classId },
    admin: { id: data.admin }
  });

  return await cameraRepo.save(config);
};




exports.getAllCameraConfigs = async () => {
  return await cameraRepo.find({
    relations: ["class", "admin"],
  });
};


exports.updateCameraConfig = async (id, data) => {
  const config = await cameraRepo.findOneBy({ id });
  if (!config) return null;

  // Handle class update if provided
  if (data.class) {
    let classId = data.class;

    if (typeof data.class === "string") {
      const classEntity = await classRepo
        .createQueryBuilder("class")
        .where("LOWER(class.name) = LOWER(:name)", { name: data.class })
        .getOne();

      if (!classEntity) throw new Error(`Class "${data.class}" not found`);
      classId = classEntity.id;
    }

    // Replace class string with object for TypeORM relation
    data.class = { id: classId };
  }

  cameraRepo.merge(config, data);
  return await cameraRepo.save(config);
};




exports.getCameraConfigById = async (id) => {
  return await cameraRepo.findOne({
    where: { id },
    relations: ["class", "admin"],
  });
};



exports.deleteCameraConfig = async (id) => {
  const result = await cameraRepo.delete(id);
  return result.affected > 0;
};


exports.searchTimeManagement = async (className, section, department) => {
  const repo = AppDataSource.getRepository(TimeManagement);

  return await repo
    .createQueryBuilder("tm")
    .leftJoinAndSelect("tm.class", "class")
    .leftJoinAndSelect("tm.teacher", "teacher")
    .leftJoinAndSelect("tm.admin", "admin")
    .leftJoinAndSelect("class.students", "student")
    // Case-insensitive match and support partial entry
    .where("LOWER(class.name) LIKE LOWER(:className)", { className: `%${className}%` })
    .andWhere("LOWER(class.section) LIKE LOWER(:section)", { section: `%${section}%` })
    .andWhere("LOWER(student.department) LIKE LOWER(:department)", { department: `%${department}%` })
    .getMany();
};

//Attendance through perticuler camera
// Fetch setup data for attendance (camera, teacher, students)
exports.getAttendanceSetupData = async (classId, slotId) => {
  const timeRepo = AppDataSource.getRepository(TimeManagement);
  const cameraRepo = AppDataSource.getRepository(CameraConfiguration);
  const studentRepo = AppDataSource.getRepository(Student);

  const slot = await timeRepo.findOne({
    where: { id: slotId, class: { id: classId } },
    relations: ["teacher", "class"]
  });
  if (!slot) return null;

  const camera = await cameraRepo.findOne({
    where: { class: { id: classId }, status: "active" },
    relations: ["class", "admin"]
  });
  if (!camera) return null;

  const students = await studentRepo.find({
    where: { class: { id: classId } },
    select: ["id", "name", "roll_number", "face_encoding"]
  });

  return {
    camera,
    teacher: {
      id: slot.teacher.id,
      name: slot.teacher.name,
      face_encoding: slot.teacher.face_encoding
    },
    students
  };
};




