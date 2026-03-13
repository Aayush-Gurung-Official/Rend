const express = require("express");
const auth = require("../middleware/auth");
const {
  getOwnerAgreements,
  getUserAgreements,
  createAgreement,
  autoGeneratePurchaseAgreement,
  autoGenerateLeaseAgreement,
  signAgreement,
  uploadDocument,
  downloadAgreement
} = require("../controllers/agreementController");

const router = express.Router();

// Public routes (with proper authorization checks in controllers)
router.get("/owner/:ownerId", getOwnerAgreements);
router.get("/user/:userId", getUserAgreements);

// Protected routes (require authentication)
router.post("/", auth, createAgreement);
router.post("/auto-generate-purchase", auth, autoGeneratePurchaseAgreement);
router.post("/auto-generate-lease", auth, autoGenerateLeaseAgreement);
router.put("/:id/sign", auth, signAgreement);
router.post("/:id/upload-document", auth, uploadDocument);
router.get("/:id/download", auth, downloadAgreement);

module.exports = router;
