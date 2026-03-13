const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn'],
      default: 'Pending',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    proposedRent: {
      type: Number,
      default: null,
    },
    moveInDate: {
      type: Date,
      default: null,
    },
    employmentStatus: {
      type: String,
      enum: ['Employed', 'Self-Employed', 'Student', 'Unemployed', 'Retired'],
      required: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
    },
    references: [{
      name: String,
      phone: String,
      email: String,
      relationship: String,
    }],
    documents: [{
      type: String, // URL to document
      name: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    creditScore: {
      type: Number,
      min: 300,
      max: 850,
      default: null,
    },
    backgroundCheckPassed: {
      type: Boolean,
      default: false,
    },
    landlordReference: {
      name: String,
      phone: String,
      email: String,
      relationship: String,
      duration: String,
    },
    notes: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      note: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    responseMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
