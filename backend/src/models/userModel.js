const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    userType: {
      type: String,
      enum: ['owner', 'user'],
      required: true,
      default: 'user'
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    properties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }],
    rentedProperties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

