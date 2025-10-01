const { DataSource } = require("typeorm");
require("dotenv").config();
const path = require("path");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.SUPABASE_DB_HOST,
  port: 5432,
  username: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: true,
  entities: [
    path.join(__dirname, "../models/*.js") // all entities in entities folder
  ],
});

module.exports = AppDataSource;
