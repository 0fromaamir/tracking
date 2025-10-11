const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Admin",
  tableName: "admins",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    email: {
      type: "varchar",
      length: 150,
      unique: true,
      nullable: false
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false
    },
    photo: {
      type: "text", // Postgres compatible
      nullable: true
    },
    role: {
      type: "varchar",
      length: 50,
      default: "admin"
    },
    created_at: {              // ✅ optional timestamps
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    },
    updated_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    students: {
      target: "Student",
      type: "one-to-many",
      inverseSide: "admin",
      cascade: true
    },
    teachers: {
      target: "Teacher",
      type: "one-to-many",
      inverseSide: "admin",
      cascade: true
    }
  }
});