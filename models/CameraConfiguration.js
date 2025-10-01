const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CameraConfiguration",
  tableName: "camera_configurations",
  columns: {
    id: { primary: true, type: "int", generated: true },
    camera_name: { type: "varchar", length: 100, nullable: false },
    ip_address: { type: "varchar", length: 200, nullable: true },
    status: { type: "varchar", length: 20, default: "active" }
  },
  relations: {
    class: {
      target: "Class",
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
