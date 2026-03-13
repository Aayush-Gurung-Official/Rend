const express = require("express");
const auth = require("../middleware/auth");
const {
  getOwnerMaintenanceRequests,
  getTenantMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceNote,
  submitSatisfactionRating,
  getMaintenanceStats
} = require("../controllers/maintenanceController");

const router = express.Router();

// Public routes
router.get("/owner/:ownerId", getOwnerMaintenanceRequests);
router.get("/tenant/:tenantId", getTenantMaintenanceRequests);
router.get("/stats/:ownerId", getMaintenanceStats);

// Protected routes (require authentication)
router.post("/", auth, createMaintenanceRequest);
router.put("/:id/status", auth, updateMaintenanceStatus);
router.post("/:id/notes", auth, addMaintenanceNote);
router.put("/:id/rating", auth, submitSatisfactionRating);

module.exports = router;
