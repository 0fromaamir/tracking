require("dotenv").config(); // dotenv ko sabse upar load kare
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http"); // ✅ added for socket.io
const { Server } = require("socket.io"); // ✅ added for socket.io

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

    // --- Test Route for Render / DB ---
    app.get("/api/test", async (req, res) => {
      try {
        const result = await AppDataSource.query("SELECT 1+1 AS result");
        res.status(200).json({
          status: "success",
          message: "Backend & DB connected successfully!",
          dbTest: result[0]
        });
      } catch (err) {
        console.error("DB Test Error:", err);
        res.status(500).json({
          status: "error",
          message: "DB connection failed",
          error: err.message
        });
      }
    });

    // API Routes
    app.use("/api/admins", adminRoutes);
    app.use("/api/students", studentRoutes);
    app.use("/api/attendance", attendanceRoutes);
    app.use("/api/teacher", teacherRoutes);
    app.use("/api/time-management", timeManagementRoutes);
    app.use("/api/classes", classRoutes);

    app.use("/api/cameraConfig", cameraConfigurationRoutes);



    // -------------------
    // React client serving (Production only)
    // -------------------
    const clientBuildPath = path.join(__dirname, "..", "client", "build");
    app.use(express.static(clientBuildPath));

    // Fallback for SPA routes (React Router)
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });

    // -------------------
    // START SERVER + SOCKET.IO
    // -------------------
    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: ["http://localhost:3000", "https://localhost:3000"] }
    });

    // -------------------
    // SOCKET.IO SIGNALING FOR WEBRTC
    // -------------------
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // Join room
      socket.on("joinRoom", ({ roomId, role }) => {
        socket.join(roomId);
        socket.data = { roomId, role };
        console.log(`${socket.id} joined room ${roomId} as ${role}`);
      });

      // Forward WebRTC offers
      socket.on("webrtc-offer", ({ roomId, offer, from }) => {
        socket.to(roomId).emit("webrtc-offer", { offer, from });
      });

      // Forward WebRTC answers
      socket.on("webrtc-answer", ({ roomId, answer, from }) => {
        socket.to(roomId).emit("webrtc-answer", { answer, from });
      });

      // Forward ICE candidates
      socket.on("webrtc-ice-candidate", ({ roomId, candidate, from }) => {
        socket.to(roomId).emit("webrtc-ice-candidate", { candidate, from });
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        if (socket.data?.roomId) {
          socket.to(socket.data.roomId).emit("peer-left", { socketId: socket.id });
        }
      });
    });

    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ DB Error: ", err));
