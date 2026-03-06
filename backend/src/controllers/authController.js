const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { username, password, profileImage } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res
        .status(409)
        .json({ message: "This username is already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ username, passwordHash, profileImage });
    return res.status(201).json({
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    return res.json({
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { id, username, profileImage } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { username, profileImage },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
};

