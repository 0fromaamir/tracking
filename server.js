require("dotenv").config(); // dotenv ko sabse upar load kare
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import TypeORM DataSource
const AppDataSource = require("./config/dataSource");

// Routes
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const timeManagementRoutes = require("./routes/timeManagementRoutes");
const classRoutes = require("./routes/classRoutes");
const cameraConfigurationRoutes = require("./routes/cameraConfigurationRoutes");
// const movementRoutes = require("./routes/movementRoutes");

const app = express();

// Enable CORS
app.use(cors({
  origin: ["http://localhost:3000", "https://localhost:3000"], // dev + prod
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse cookies
app.use(cookieParser());

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static folders
app.use('/models', express.static(path.join(__dirname, 'face-models')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------
// DATABASE INIT
// -------------------
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Supabase connected & tables created automatically!");

    // API Routes
    app.use("/api/admins", adminRoutes);
    app.use("/api/students", studentRoutes);
    app.use("/api/attendance", attendanceRoutes);
    app.use("/api/teacher", teacherRoutes);
    app.use("/api/time-management", timeManagementRoutes);
    app.use("/api/classes", classRoutes);
    app.use("/api/camraConfig", cameraConfigurationRoutes);

    // app.use("/api/movements", movementRoutes);

    // -------------------
    // React client serving (Production only)
    // -------------------
    const clientBuildPath = path.join(__dirname, "..", "client", "build");
    app.use(express.static(clientBuildPath));

    // Fallback for SPA routes (React Router)
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });

    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ DB Error: ", err));
