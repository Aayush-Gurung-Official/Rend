const Maintenance = require("../models/maintenanceModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");

// GET /api/maintenance/owner/:ownerId
const getOwnerMaintenanceRequests = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { status, priority, category, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { owner: ownerId };
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    
    const requests = await Maintenance.find(filter)
      .populate('tenant', 'username fullName phone email profileImage')
      .populate('property', 'name address city')
      .populate('assignedTo', 'username fullName')
      .sort({ requestedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Maintenance.countDocuments(filter);

    // Get stats
    const stats = {
      total: await Maintenance.countDocuments({ owner: ownerId }),
      open: await Maintenance.countDocuments({ owner: ownerId, status: 'Open' }),
      inProgress: await Maintenance.countDocuments({ owner: ownerId, status: 'In Progress' }),
      completed: await Maintenance.countDocuments({ owner: ownerId, status: 'Completed' }),
      urgent: await Maintenance.countDocuments({ owner: ownerId, priority: 'Urgent' }),
    };

    res.json({
      requests,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/maintenance/tenant/:tenantId
const getTenantMaintenanceRequests = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { tenant: tenantId };
    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const requests = await Maintenance.find(filter)
      .populate('property', 'name address city')
      .populate('owner', 'username fullName phone email')
      .populate('assignedTo', 'username fullName')
      .sort({ requestedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Maintenance.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/maintenance
const createMaintenanceRequest = async (req, res, next) => {
  try {
    const {
      propertyId,
      title,
      description,
      category,
      priority,
      images,
      videos,
      tenantAccess,
      emergencyContact,
      estimatedCost
    } = req.body;

    const tenantId = req.user?.id;

    if (!tenantId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify tenant relationship with property
    const property = await Property.findOne({ 
      _id: propertyId, 
      tenant: tenantId 
    }).populate('owner');

    if (!property) {
      return res.status(404).json({ message: "Property not found or not authorized" });
    }

    const maintenance = await Maintenance.create({
      property: propertyId,
      tenant: tenantId,
      owner: property.owner._id,
      title,
      description,
      category,
      priority: priority || 'Medium',
      images: images || [],
      videos: videos || [],
      tenantAccess: tenantAccess || {},
      emergencyContact: emergencyContact || {},
      estimatedCost,
      timeline: [{
        status: 'Open',
        date: new Date(),
        updatedBy: tenantId,
        notes: 'Maintenance request created'
      }]
    });

    const populatedRequest = await Maintenance.findById(maintenance._id)
      .populate('property', 'name address city')
      .populate('owner', 'username fullName phone email')
      .populate('tenant', 'username fullName phone email profileImage');

    res.status(201).json(populatedRequest);
  } catch (err) {
    next(err);
  }
};

// PUT /api/maintenance/:id/status
const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo, scheduledDate, estimatedCost, actualCost } = req.body;
    const userId = req.user?.id;

    const maintenance = await Maintenance.findById(id).populate('property');
    
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    // Check authorization (owner or assigned staff can update)
    if (maintenance.owner.toString() !== userId && 
        maintenance.assignedTo?.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    const updateData = {
      status,
      assignedTo,
      scheduledDate,
      estimatedCost,
      actualCost,
    };

    if (status === 'Completed') {
      updateData.completedDate = new Date();
    }

    // Add to timeline
    const timelineEntry = {
      status,
      date: new Date(),
      updatedBy: userId,
      notes: notes || `Status updated to ${status}`
    };

    const updatedRequest = await Maintenance.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: { timeline: timelineEntry }
      },
      { new: true }
    ).populate('tenant', 'username fullName phone email')
     .populate('property', 'name address city')
     .populate('assignedTo', 'username fullName');

    res.json(updatedRequest);
  } catch (err) {
    next(err);
  }
};

// POST /api/maintenance/:id/notes
const addMaintenanceNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, isInternal } = req.body;
    const userId = req.user?.id;

    if (!note) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const maintenance = await Maintenance.findById(id);
    
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    // Check authorization
    if (maintenance.owner.toString() !== userId && 
        maintenance.tenant.toString() !== userId &&
        maintenance.assignedTo?.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to add notes" });
    }

    const updatedRequest = await Maintenance.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            author: userId,
            note,
            isInternal: isInternal || false,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('notes.author', 'username fullName')
     .populate('tenant', 'username fullName phone email')
     .populate('property', 'name address city');

    res.json(updatedRequest);
  } catch (err) {
    next(err);
  }
};

// PUT /api/maintenance/:id/rating
const submitSatisfactionRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const tenantId = req.user?.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const maintenance = await Maintenance.findById(id);
    
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    if (maintenance.tenant.toString() !== tenantId) {
      return res.status(403).json({ message: "Not authorized to rate this request" });
    }

    if (maintenance.status !== 'Completed') {
      return res.status(400).json({ message: "Can only rate completed maintenance requests" });
    }

    const updatedRequest = await Maintenance.findByIdAndUpdate(
      id,
      {
        satisfactionRating: rating,
        satisfactionFeedback: feedback || ''
      },
      { new: true }
    ).populate('property', 'name address city')
     .populate('owner', 'username fullName phone email');

    res.json(updatedRequest);
  } catch (err) {
    next(err);
  }
};

// GET /api/maintenance/stats/:ownerId
const getMaintenanceStats = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { period = '6months' } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case '1month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
      case '3months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
        break;
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
    }

    const stats = await Maintenance.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          requestedDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          avgCost: { $avg: '$actualCost' }
        }
      }
    ]);

    const statusStats = await Maintenance.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          requestedDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Maintenance.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          requestedDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgSatisfaction = await Maintenance.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          satisfactionRating: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$satisfactionRating' },
          totalRated: { $sum: 1 }
        }
      }
    ]);

    res.json({
      categoryStats: stats,
      statusStats,
      priorityStats,
      satisfaction: avgSatisfaction[0] || { avgRating: 0, totalRated: 0 },
      period
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOwnerMaintenanceRequests,
  getTenantMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceNote,
  submitSatisfactionRating,
  getMaintenanceStats
};
