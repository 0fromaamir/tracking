



// const AppDataSource = require("../config/dataSource");
// const Movement = require("../models/Movemenet");

// class MovementService {
//   movementRepo = AppDataSource.getRepository("Movement");

//   async logMovement({ movementType, studentId, teacherId, adminId }) {
//     const movement = this.movementRepo.create({
//       movementType,
//       student: studentId ? { id: studentId } : null,
//       teacher: teacherId ? { id: teacherId } : null,
//       admin: { id: adminId },
//     });

//     return await this.movementRepo.save(movement);
//   }

//   async getMovements({ studentId, teacherId, adminId }) {
//     const qb = this.movementRepo
//       .createQueryBuilder("movement")
//       .leftJoinAndSelect("movement.student", "student")
//       .leftJoinAndSelect("movement.teacher", "teacher")
//       .leftJoinAndSelect("movement.admin", "admin");

//     if (studentId) qb.andWhere("student.id = :studentId", { studentId });
//     if (teacherId) qb.andWhere("teacher.id = :teacherId", { teacherId });
//     if (adminId) qb.andWhere("admin.id = :adminId", { adminId });

//     return await qb.getMany();
//   }
// }

// module.exports = new MovementService();
