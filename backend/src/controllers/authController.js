const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, userType, profileImage, bio } = req.body;

    if (!username || !email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Username, email, password and full name are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(409)
        .json({ message: "This username is already taken" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ message: "This email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ 
      username, 
      email, 
      passwordHash, 
      fullName, 
      phone, 
      userType: userType || 'user', 
      profileImage, 
      bio 
    });
    
    const token = generateToken(user._id);
    
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        userType: user.userType,
        profileImage: user.profileImage,
        bio: user.bio,
      }
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

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        userType: user.userType,
        profileImage: user.profileImage,
        bio: user.bio,
      }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { id, username, email, fullName, phone, profileImage, bio } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }

    // Check if username is being changed and if it's already taken
    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: id } });
      if (existingUsername) {
        return res.status(409).json({ message: "This username is already taken" });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        return res.status(409).json({ message: "This email is already registered" });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { username, email, fullName, phone, profileImage, bio },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      userType: user.userType,
      profileImage: user.profileImage,
      bio: user.bio,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile/:id
const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const user = await User.findById(id).populate('properties').populate('rentedProperties');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      userType: user.userType,
      profileImage: user.profileImage,
      bio: user.bio,
      properties: user.properties,
      rentedProperties: user.rentedProperties,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
  getProfile,
};

