const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Student",
  tableName: "students",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: { type: "varchar", length: 100, nullable: false },
    roll_number: { type: "varchar", length: 50, unique: true, nullable: false },
    email: { type: "varchar", length: 150, unique: true, nullable: false },
    phone: { type: "varchar", length: 15, nullable: true },
    department: { type: "varchar", length: 100, nullable: true },
    year: { type: "varchar", length: 20, nullable: true },
    profile_image: { type: "text", nullable: true },

    // ✅ JSONB for float array
    face_encoding: { type: "jsonb", nullable: true },

    created_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    updated_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    admin: {
      target: "Admin",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE"
    },
    teachers: {
      target: "Teacher",
      type: "many-to-many",
      mappedBy: "students"
    },
    attendance: {
      target: "Attendance",
      type: "one-to-many",
      inverseSide: "student"
    },
    // Relation with Class
    class: {
      target: "Class",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
      onDelete: "SET NULL"
    }
  }
});
