const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Class",
  tableName: "classes",
  columns: {
    id: { primary: true, type: "int", generated: true },
    name: { type: "varchar", length: 100, nullable: false },   // e.g. Class 1
    // ✅ Section column moved from Student.js
    section: { type: "varchar", length: 50, nullable: true },  // e.g. A
    // ✅ Classes column moved from Student.js
    // classes: { type: "varchar", length: 200, nullable: true },
    year: { type: "varchar", length: 20, nullable: true }      // e.g. 2025
  },
  relations: {
    students: {
      target: "Student",
      type: "one-to-many",
      inverseSide: "class"
    }
  }
});