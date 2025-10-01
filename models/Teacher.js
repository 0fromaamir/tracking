const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Teacher",
  tableName: "teachers",
  columns: {
    id: { primary: true, type: "int", generated: true },

    name: { type: "varchar", length: 100, nullable: false },
    email: { type: "varchar", length: 150, unique: true, nullable: false },
    phone: { type: "varchar", length: 15, nullable: true },
    department: { type: "varchar", length: 100, nullable: false },
    designation: { type: "varchar", length: 100, nullable: true },
    qualification: { type: "varchar", length: 255, nullable: true },
    photo: { type: "text", nullable: true },
    joining_date: { type: "date", nullable: true },
    password: { type: "varchar", length: 255, nullable: false },

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
      nullable: true, // teacher can exist without admin
      onDelete: "SET NULL"
    },
    students: {
      target: "Student",
      type: "many-to-many",
      joinTable: {
        name: "teacher_students"
      }
    },
    attendance: {
      target: "Attendance",
      type: "one-to-many",
      inverseSide: "teacher"
    }
  }
});
