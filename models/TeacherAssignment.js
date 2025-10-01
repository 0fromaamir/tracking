const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "TeacherAssignment",
  tableName: "teacher_assignments",
  columns: {
    id: { primary: true, type: "int", generated: true },
    department: { type: "varchar", length: 100 },
    year: { type: "varchar", length: 20 },
    classes: { type: "varchar", length: 100 },
    section: { type: "varchar", length: 50 },
    created_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    updated_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" }
  },
  relations: {
    teacher: {
      target: "Teacher",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
    admin: {
      target: "Admin",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    }
  }
});
