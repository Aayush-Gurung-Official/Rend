const express = require("express");
const {
  getAllProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties
} = require("../controllers/propertyController");

const router = express.Router();

// Public routes
router.get("/", getAllProperties);
router.get("/featured", getFeaturedProperties);
router.get("/:id", getPropertyById);

// Protected routes (require authentication)
router.post("/", createProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.get("/owner/:ownerId", getOwnerProperties);

module.exports = router;
