const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "TeacherLeave",
  tableName: "teacher_leaves",
  columns: {
    id: { primary: true, type: "int", generated: true },
    leave_date: { type: "date", nullable: false },
    reason: { type: "text", nullable: true },
    status: { type: "varchar", length: 20, default: "approved" }
  },
  relations: {
    teacher: {
      target: "Teacher",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    }
  }
});
