const express = require("express");
const router = express.Router();
const timeManagementController = require("../controllers/timeManagementController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Create new time slot
router.post("/", verifyToken, verifyAdmin, (req, res) => timeManagementController.create(req, res));

// ✅ Search without department (must come before /:id)
router.get(
  "/search-without-dept",
  verifyToken,
  verifyAdmin,
  (req, res) => timeManagementController.searchWithoutDepartment(req, res)
);

// Search by class & department
router.get("/search", verifyToken, verifyAdmin, (req, res) => timeManagementController.search(req, res));

// Get all time slots
router.get("/", verifyToken, verifyAdmin, (req, res) => timeManagementController.getAll(req, res));

// Get by ID (dynamic route comes last)
router.get("/:id", verifyToken, verifyAdmin, (req, res) => timeManagementController.getById(req, res));

// Update
router.put("/:id", verifyToken, verifyAdmin, (req, res) => timeManagementController.update(req, res));

// Delete
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => timeManagementController.delete(req, res));

module.exports = router;
