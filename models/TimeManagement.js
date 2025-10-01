const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "TimeManagement",
  tableName: "time_management",
  columns: {
    id: { primary: true, type: "int", generated: true },
    subject: { type: "varchar", length: 100, nullable: false },
    start_time: { type: "time", nullable: false },
    end_time: { type: "time", nullable: false },
    day_of_week: { type: "varchar", length: 20, nullable: false } // e.g. Monday
  },
  relations: {
    class: {
      target: "Class",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
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
