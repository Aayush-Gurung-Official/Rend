const Agreement = require("../models/agreementModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");

// GET /api/agreements/owner/:ownerId
const getOwnerAgreements = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;

    // Build filter for owner's properties
    const filter = {
      $or: [
        { 'parties.landlord': ownerId },
        { 'parties.seller': ownerId },
        { createdBy: ownerId }
      ]
    };

    if (type && type !== 'All') {
      filter.type = type;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const agreements = await Agreement.find(filter)
      .populate('property', 'name address city')
      .populate('parties.landlord parties.tenant parties.buyer parties.seller', 'username fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Agreement.countDocuments(filter);

    res.json({
      agreements,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAgreements: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/agreements/user/:userId
const getUserAgreements = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;

    // Build filter for user's agreements
    const filter = {
      $or: [
        { 'parties.tenant': userId },
        { 'parties.buyer': userId },
        { createdBy: userId }
      ]
    };

    if (type && type !== 'All') {
      filter.type = type;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const agreements = await Agreement.find(filter)
      .populate('property', 'name address city')
      .populate('parties.landlord parties.tenant parties.buyer parties.seller', 'username fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Agreement.countDocuments(filter);

    res.json({
      agreements,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAgreements: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/agreements
const createAgreement = async (req, res, next) => {
  try {
    const {
      title,
      type,
      propertyId,
      parties,
      terms,
      dates,
      customClauses,
      notes
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate property ownership for lease/purchase agreements
    if (type === 'lease' || type === 'purchase') {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // For lease agreements, verify landlord is property owner
      if (type === 'lease' && property.owner.toString() !== parties.landlord) {
        return res.status(403).json({ message: "Only property owner can create lease agreements" });
      }

      // For purchase agreements, verify seller is property owner
      if (type === 'purchase' && property.owner.toString() !== parties.seller) {
        return res.status(403).json({ message: "Only property owner can create purchase agreements" });
      }
    }

    const agreement = await Agreement.create({
      title,
      type,
      property: propertyId,
      parties,
      terms,
      dates,
      customClauses,
      notes,
      createdBy: userId,
      status: 'draft'
    });

    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('property', 'name address city')
      .populate('parties.landlord parties.tenant parties.buyer parties.seller', 'username fullName email');

    res.status(201).json(populatedAgreement);
  } catch (err) {
    next(err);
  }
};

// POST /api/agreements/auto-generate-purchase
const autoGeneratePurchaseAgreement = async (req, res, next) => {
  try {
    const { propertyId, buyerId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get property details
    const property = await Property.findById(propertyId).populate('owner');
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Get buyer details
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Create purchase agreement
    const agreement = await Agreement.create({
      title: `Purchase Agreement - ${property.name}`,
      type: 'purchase',
      property: propertyId,
      parties: {
        buyer: buyerId,
        seller: property.owner._id,
        witnesses: []
      },
      terms: {
        purchasePrice: property.salePrice,
        paymentMethod: 'Bank Transfer',
        paymentSchedule: 'Full payment upon signing',
        maintenanceResponsibilities: 'Buyer responsibility after transfer',
        utilities: ['Water', 'Electricity', 'Gas'],
        restrictions: ['No commercial activities', 'Pet restrictions as per building rules']
      },
      dates: {
        startDate: new Date(),
        signingDate: new Date(),
        // Set completion date 30 days from now
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      status: 'pending',
      autoGenerated: true,
      createdBy: userId
    });

    // Update property status to 'Under Contract'
    await Property.findByIdAndUpdate(propertyId, { status: 'Under Contract' });

    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('property', 'name address city')
      .populate('parties.buyer parties.seller', 'username fullName email');

    res.status(201).json(populatedAgreement);
  } catch (err) {
    next(err);
  }
};

// POST /api/agreements/auto-generate-lease
const autoGenerateLeaseAgreement = async (req, res, next) => {
  try {
    const { propertyId, tenantId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get property details
    const property = await Property.findById(propertyId).populate('owner');
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Get tenant details
    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Create lease agreement
    const agreement = await Agreement.create({
      title: `Lease Agreement - ${property.name}`,
      type: 'lease',
      property: propertyId,
      parties: {
        landlord: property.owner._id,
        tenant: tenantId,
        witnesses: []
      },
      terms: {
        duration: '12 months',
        rentAmount: property.monthlyRent,
        securityDeposit: property.securityDeposit || property.monthlyRent * 2,
        paymentMethod: 'Bank Transfer',
        paymentSchedule: 'Monthly on 1st day',
        maintenanceResponsibilities: 'Landlord for structural, Tenant for cosmetic',
        utilities: ['Water', 'Trash'],
        restrictions: ['No smoking', 'No pets without permission'],
        noticePeriod: '30 days'
      },
      dates: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        signingDate: new Date()
      },
      status: 'active',
      autoGenerated: true,
      createdBy: userId
    });

    // Update property status and tenant
    await Property.findByIdAndUpdate(propertyId, { 
      status: 'Rented',
      tenant: tenantId 
    });

    const populatedAgreement = await Agreement.findById(agreement._id)
      .populate('property', 'name address city')
      .populate('parties.landlord parties.tenant', 'username fullName email');

    res.status(201).json(populatedAgreement);
  } catch (err) {
    next(err);
  }
};

// PUT /api/agreements/:id/sign
const signAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signature, role } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // Check if user is authorized to sign
    const isAuthorized = [
      agreement.parties.landlord?.toString(),
      agreement.parties.tenant?.toString(),
      agreement.parties.buyer?.toString(),
      agreement.parties.seller?.toString()
    ].includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to sign this agreement" });
    }

    // Check if already signed
    const existingSignature = agreement.signatures.find(sig => sig.party.toString() === userId);
    if (existingSignature) {
      return res.status(400).json({ message: "Already signed" });
    }

    // Add signature
    agreement.signatures.push({
      party: userId,
      role,
      signature,
      signedAt: new Date(),
      ipAddress: req.ip
    });

    // Update status if all parties have signed
    const requiredSignatures = agreement.type === 'lease' ? 2 : agreement.type === 'purchase' ? 2 : 1;
    if (agreement.signatures.length >= requiredSignatures) {
      agreement.status = 'active';
    }

    await agreement.save();

    const updatedAgreement = await Agreement.findById(id)
      .populate('property', 'name address city')
      .populate('parties.landlord parties.tenant parties.buyer parties.seller', 'username fullName email')
      .populate('signatures.party', 'username fullName');

    res.json(updatedAgreement);
  } catch (err) {
    next(err);
  }
};

// POST /api/agreements/:id/upload-document
const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, url, type, size, mimeType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // Check authorization
    const isAuthorized = [
      agreement.parties.landlord?.toString(),
      agreement.parties.tenant?.toString(),
      agreement.parties.buyer?.toString(),
      agreement.parties.seller?.toString(),
      agreement.createdBy.toString()
    ].includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to upload documents" });
    }

    agreement.documents.push({
      name,
      url,
      type: type || 'agreement',
      size,
      mimeType,
      uploadDate: new Date()
    });

    await agreement.save();

    res.json({ message: "Document uploaded successfully", document: agreement.documents[agreement.documents.length - 1] });
  } catch (err) {
    next(err);
  }
};

// GET /api/agreements/:id/download
const downloadAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const agreement = await Agreement.findById(id)
      .populate('property', 'name address city')
      .populate('parties.landlord parties.tenant parties.buyer parties.seller', 'username fullName email phone');

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // Check authorization
    const isAuthorized = [
      agreement.parties.landlord?.toString(),
      agreement.parties.tenant?.toString(),
      agreement.parties.buyer?.toString(),
      agreement.parties.seller?.toString(),
      agreement.createdBy.toString()
    ].includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to download this agreement" });
    }

    // Generate PDF content (simplified for demo)
    const pdfContent = generatePDFContent(agreement);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${agreement.title}.pdf"`);
    res.send(pdfContent);
  } catch (err) {
    next(err);
  }
};

// Helper function to generate PDF content
const generatePDFContent = (agreement) => {
  // This is a simplified version - in production, use a PDF library like puppeteer or jsPDF
  let content = `${agreement.title}\n\n`;
  content += `Agreement Type: ${agreement.type}\n`;
  content += `Status: ${agreement.status}\n`;
  content += `Created: ${agreement.createdAt}\n\n`;

  if (agreement.property) {
    content += `Property Details:\n`;
    content += `Name: ${agreement.property.name}\n`;
    content += `Address: ${agreement.property.address}, ${agreement.property.city}\n\n`;
  }

  content += `Parties:\n`;
  if (agreement.parties.landlord) {
    content += `Landlord: ${agreement.parties.landlord.fullName || agreement.parties.landlord.username}\n`;
  }
  if (agreement.parties.tenant) {
    content += `Tenant: ${agreement.parties.tenant.fullName || agreement.parties.tenant.username}\n`;
  }
  if (agreement.parties.buyer) {
    content += `Buyer: ${agreement.parties.buyer.fullName || agreement.parties.buyer.username}\n`;
  }
  if (agreement.parties.seller) {
    content += `Seller: ${agreement.parties.seller.fullName || agreement.parties.seller.username}\n`;
  }

  content += `\nTerms:\n`;
  if (agreement.terms.rentAmount) {
    content += `Rent Amount: NPR ${agreement.terms.rentAmount}\n`;
  }
  if (agreement.terms.purchasePrice) {
    content += `Purchase Price: NPR ${agreement.terms.purchasePrice}\n`;
  }
  if (agreement.terms.duration) {
    content += `Duration: ${agreement.terms.duration}\n`;
  }

  content += `\nSignatures:\n`;
  agreement.signatures.forEach(sig => {
    content += `${sig.role}: ${sig.party.fullName || sig.party.username} - Signed on ${sig.signedAt}\n`;
  });

  return Buffer.from(content, 'utf8');
};

module.exports = {
  getOwnerAgreements,
  getUserAgreements,
  createAgreement,
  autoGeneratePurchaseAgreement,
  autoGenerateLeaseAgreement,
  signAgreement,
  uploadDocument,
  downloadAgreement
};
