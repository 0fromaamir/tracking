const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Attendance",
  tableName: "attendance",
  columns: {
    id: { primary: true, type: "int", generated: true },
    date: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    status: { type: "varchar", length: 20, nullable: false }, // Present / Absent
    subject: { type: "varchar", length: 100, nullable: false }, // New field
    created_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    updated_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    student: {
      target: "Student",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
    teacher: {
      target: "Teacher",
      type: "many-to-one",
      joinColumn: true,
      nullable: true, // nullable kyunki kabhi substitute teacher ho sakta hai
      onDelete: "SET NULL"
    },
    class: {
      target: "Class",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    }
  }
});
