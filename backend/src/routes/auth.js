const express = require("express");
const { signup, login, updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/profile", updateProfile);

module.exports = router;

