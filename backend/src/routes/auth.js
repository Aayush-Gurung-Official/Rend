const express = require("express");
const { signup, login, updateProfile, getProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/profile", updateProfile);
router.get("/profile/:id", getProfile);

module.exports = router;

