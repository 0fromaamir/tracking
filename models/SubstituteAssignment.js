const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "SubstituteAssignment",
  tableName: "substitute_assignments",
  columns: {
    id: { primary: true, type: "int", generated: true },
    subject: { type: "varchar", length: 100, nullable: false },
    date: { type: "date", nullable: false }
  },
  relations: {
    original_teacher: {
      target: "Teacher",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
    substitute_teacher: {
      target: "Teacher",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
    class: {
      target: "Class",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
    time_management: {
      target: "TimeManagement",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
      onDelete: "SET NULL"
    }
  }
});
