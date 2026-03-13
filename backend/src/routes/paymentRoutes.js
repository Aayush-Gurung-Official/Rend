const express = require("express");
const auth = require("../middleware/auth");
const {
  getOwnerPayments,
  getTenantPayments,
  createPayment,
  markPaymentAsPaid,
  generateRentPayments,
  getPaymentStats
} = require("../controllers/paymentController");

const router = express.Router();

// Public routes
router.get("/owner/:ownerId", getOwnerPayments);
router.get("/tenant/:tenantId", getTenantPayments);
router.get("/stats/:ownerId", getPaymentStats);

// Protected routes (require authentication)
router.post("/", auth, createPayment);
router.put("/:id/pay", auth, markPaymentAsPaid);
router.post("/generate-rent-payments", auth, generateRentPayments);

module.exports = router;
