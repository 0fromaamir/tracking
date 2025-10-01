const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Create Class
router.post("/", verifyToken, verifyAdmin, (req, res) => classController.create(req, res));

// Get All Classes
router.get("/", verifyToken, verifyAdmin, (req, res) => classController.getAll(req, res));

// Get Class by ID
router.get("/:id", verifyToken, verifyAdmin, (req, res) => classController.getById(req, res));

// ✅ Get Class Encodings (students + teachers)
router.get("/:id/encodings", verifyToken, verifyAdmin, (req, res) =>
  classController.getEncodings(req, res)
);

// Update Class
router.put("/:id", verifyToken, verifyAdmin, (req, res) => classController.update(req, res));

// Delete Class
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => classController.delete(req, res));

module.exports = router;
