const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Plumbing',
        'Electrical',
        'HVAC',
        'Appliance',
        'Pest Control',
        'Structural',
        'Landscaping',
        'Security',
        'Cleaning',
        'Other'
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled', 'Reopened'],
      default: 'Open',
    },
    images: [{
      type: String, // URL to image
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    videos: [{
      type: String, // URL to video
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    estimatedCost: {
      type: Number,
      default: null,
    },
    actualCost: {
      type: Number,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Maintenance staff or contractor
      default: null,
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
      isInternal: {
        type: Boolean,
        default: false, // Internal notes not visible to tenant
      }
    }],
    timeline: [{
      status: String,
      date: Date,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
    }],
    tenantAccess: {
      canEnter: {
        type: Boolean,
        default: false,
      },
      preferredTimes: [{
        day: String, // Monday, Tuesday, etc.
        startTime: String, // 09:00
        endTime: String, // 17:00
      }],
      restrictions: String,
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    satisfactionFeedback: {
      type: String,
      default: '',
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    permissions: {
      ownerApproval: {
        type: Boolean,
        default: false,
      },
      ownerApprovalDate: Date,
      tenantConfirmation: {
        type: Boolean,
        default: false,
      },
      tenantConfirmationDate: Date,
    }
  },
  { timestamps: true }
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

module.exports = Maintenance;
