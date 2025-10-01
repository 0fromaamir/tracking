// const { EntitySchema } = require("typeorm");

// module.exports = new EntitySchema({
//   name: "Movement",
//   tableName: "movements",
//   columns: {
//     id: {
//       primary: true,
//       type: "int",
//       generated: true,
//     },
//     movementType: {
//       type: "varchar",
//       length: 100,
//       nullable: false, 
//       // e.g. walking, sitting, standing, leaving, entering
//     },
//     timestamp: {
//       type: "timestamp",
//       default: () => "CURRENT_TIMESTAMP",
//     },
//     created_at: { 
//       type: "timestamp",
//       default: () => "CURRENT_TIMESTAMP"
//     },
//     updated_at: {
//       type: "timestamp",
//       default: () => "CURRENT_TIMESTAMP",
//       onUpdate: "CURRENT_TIMESTAMP"
//     }
//   },
//   relations: {
//     student: {
//       target: "Student",
//       type: "many-to-one",
//       joinColumn: true,
//       nullable: true, // movement can belong to student OR teacher
//       onDelete: "CASCADE",
//     },
//     teacher: {
//       target: "Teacher",
//       type: "many-to-one",
//       joinColumn: true,
//       nullable: true, // movement can belong to student OR teacher
//       onDelete: "CASCADE",
//     },
//     admin: {
//       target: "Admin",
//       type: "many-to-one",
//       joinColumn: true,
//       nullable: false, // always tied to an admin
//       onDelete: "CASCADE",
//     },
//   }
// });
