const express = require("express");
const auth = require("../middleware/auth");
const {
  getOwnerTenants,
  getApplicantApplications,
  applyForProperty,
  approveApplication,
  rejectApplication,
  withdrawApplication,
  addApplicationNote
} = require("../controllers/tenantController");

const router = express.Router();

// Public routes
router.get("/owner/:ownerId", getOwnerTenants);
router.get("/applications/:applicantId", getApplicantApplications);

// Protected routes (require authentication)
router.post("/apply", auth, applyForProperty);
router.put("/applications/:id/approve", auth, approveApplication);
router.put("/applications/:id/reject", auth, rejectApplication);
router.put("/applications/:id/withdraw", auth, withdrawApplication);
router.post("/applications/:id/notes", auth, addApplicationNote);

module.exports = router;
