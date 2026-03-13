const Application = require("../models/applicationModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");

// GET /api/tenants/owner/:ownerId
const getOwnerTenants = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Get properties owned by this owner
    const ownerProperties = await Property.find({ owner: ownerId }).select('_id');
    const propertyIds = ownerProperties.map(p => p._id);

    // Build filter
    const filter = { owner: ownerId };
    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const applications = await Application.find(filter)
      .populate('applicant', 'username fullName phone email profileImage')
      .populate('property', 'name address city monthlyRent bedrooms bathrooms')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    // Get stats
    const stats = {
      total: await Application.countDocuments({ owner: ownerId }),
      pending: await Application.countDocuments({ owner: ownerId, status: 'Pending' }),
      approved: await Application.countDocuments({ owner: ownerId, status: 'Approved' }),
      rejected: await Application.countDocuments({ owner: ownerId, status: 'Rejected' }),
    };

    res.json({
      applications,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tenants/applications/:applicantId
const getApplicantApplications = async (req, res, next) => {
  try {
    const { applicantId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { applicant: applicantId };
    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const applications = await Application.find(filter)
      .populate('property', 'name address city monthlyRent bedrooms bathrooms images')
      .populate('owner', 'username fullName phone email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/tenants/apply
const applyForProperty = async (req, res, next) => {
  try {
    const {
      propertyId,
      message,
      proposedRent,
      moveInDate,
      employmentStatus,
      monthlyIncome,
      references,
      documents,
      creditScore,
      backgroundCheckPassed,
      landlordReference
    } = req.body;

    const applicantId = req.user?.id;

    if (!applicantId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if property is available
    if (property.status !== 'Available') {
      return res.status(400).json({ message: "Property is not available for applications" });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      applicant: applicantId,
      property: propertyId,
      status: { $ne: 'Withdrawn' }
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this property" });
    }

    const application = await Application.create({
      property: propertyId,
      applicant: applicantId,
      owner: property.owner,
      message,
      proposedRent,
      moveInDate,
      employmentStatus,
      monthlyIncome,
      references,
      documents,
      creditScore,
      backgroundCheckPassed,
      landlordReference
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('property', 'name address city monthlyRent bedrooms bathrooms')
      .populate('owner', 'username fullName phone email profileImage');

    res.status(201).json(populatedApplication);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tenants/applications/:id/approve
const approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;
    const { responseMessage, leaseTerms } = req.body;

    const application = await Application.findById(id).populate('property');
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized to approve this application" });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({ message: "Application is not pending" });
    }

    // Update application status
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        status: 'Approved',
        reviewedBy: ownerId,
        reviewedAt: new Date(),
        responseMessage: responseMessage || 'Your application has been approved!'
      },
      { new: true }
    ).populate('applicant', 'username fullName phone email')
     .populate('property', 'name address city');

    // Update property status to Rented
    await Property.findByIdAndUpdate(application.property._id, {
      status: 'Rented',
      tenant: application.applicant
    });

    // Add property to user's rented properties
    await User.findByIdAndUpdate(application.applicant, {
      $push: { rentedProperties: application.property._id }
    });

    // Reject other pending applications for this property
    await Application.updateMany(
      {
        property: application.property._id,
        status: 'Pending',
        _id: { $ne: id }
      },
      {
        status: 'Rejected',
        reviewedBy: ownerId,
        reviewedAt: new Date(),
        responseMessage: 'This property has been rented to another applicant.'
      }
    );

    res.json(updatedApplication);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tenants/applications/:id/reject
const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;
    const { responseMessage } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized to reject this application" });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({ message: "Application is not pending" });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        status: 'Rejected',
        reviewedBy: ownerId,
        reviewedAt: new Date(),
        responseMessage: responseMessage || 'Your application has been rejected.'
      },
      { new: true }
    ).populate('applicant', 'username fullName phone email')
     .populate('property', 'name address city');

    res.json(updatedApplication);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tenants/applications/:id/withdraw
const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicantId = req.user?.id;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.applicant.toString() !== applicantId) {
      return res.status(403).json({ message: "Not authorized to withdraw this application" });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({ message: "Cannot withdraw application that is not pending" });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status: 'Withdrawn' },
      { new: true }
    ).populate('property', 'name address city');

    res.json(updatedApplication);
  } catch (err) {
    next(err);
  }
};

// POST /api/tenants/applications/:id/notes
const addApplicationNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user?.id;

    if (!note) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            author: userId,
            note,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('notes.author', 'username fullName');

    res.json(updatedApplication);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOwnerTenants,
  getApplicantApplications,
  applyForProperty,
  approveApplication,
  rejectApplication,
  withdrawApplication,
  addApplicationNote
};
