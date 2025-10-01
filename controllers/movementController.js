


// const movementService = require("../services/movementService");

// exports.logMovement = async (req, res) => {
//   try {
//     const { movementType, studentId, teacherId, adminId } = req.body;

//     if (!movementType || !adminId) {
//       return res.status(400).json({
//         success: false,
//         message: "movementType and adminId are required",
//       });
//     }

//     const movement = await movementService.logMovement({
//       movementType,
//       studentId,
//       teacherId,
//       adminId,
//     });

//     res.json({ success: true, data: movement });
//   } catch (error) {
//     console.error("Error logging movement:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// exports.getMovements = async (req, res) => {
//   try {
//     const { studentId, teacherId, adminId } = req.query;
//     const movements = await movementService.getMovements({
//       studentId,
//       teacherId,
//       adminId,
//     });
//     res.json({ success: true, data: movements });
//   } catch (error) {
//     console.error("Error fetching movements:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
