const Property = require("../models/propertyModel");
const User = require("../models/userModel");

// GET /api/properties
const getAllProperties = async (req, res, next) => {
  try {
    const { 
      listingType, 
      propertyType, 
      location, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      featured,
      page = 1, 
      limit = 12 
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (listingType && listingType !== 'All') {
      if (listingType === 'For Rent') {
        filter.listingType = { $in: ['For Rent', 'For Both'] };
      } else if (listingType === 'For Sale') {
        filter.listingType = { $in: ['For Sale', 'For Both'] };
      } else {
        filter.listingType = listingType;
      }
    }

    if (propertyType && propertyType !== 'All') {
      filter.propertyType = propertyType;
    }

    if (location) {
      filter.$or = [
        { city: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } }
      ];
    }

    if (bedrooms && bedrooms !== 'Any') {
      if (bedrooms === 'Studio') {
        filter.bedrooms = 0;
      } else if (bedrooms.includes('+')) {
        const minBeds = parseInt(bedrooms.replace('+', ''));
        filter.bedrooms = { $gte: minBeds };
      } else {
        filter.bedrooms = parseInt(bedrooms);
      }
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    // Price filtering
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (listingType === 'For Rent' || listingType === 'For Both') {
        if (minPrice) priceFilter.$gte = parseInt(minPrice.replace(/,/g, ''));
        if (maxPrice) priceFilter.$lte = parseInt(maxPrice.replace(/,/g, ''));
        filter.monthlyRent = priceFilter;
      } else if (listingType === 'For Sale') {
        if (minPrice) priceFilter.$gte = parseInt(minPrice.replace(/,/g, ''));
        if (maxPrice) priceFilter.$lte = parseInt(maxPrice.replace(/,/g, ''));
        filter.salePrice = priceFilter;
      }
    }

    const skip = (page - 1) * limit;
    
    const properties = await Property.find(filter)
      .populate('owner', 'username fullName phone email profileImage')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/properties/featured
const getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ 
      featured: true, 
      isActive: true, 
      status: 'Available' 
    })
      .populate('owner', 'username fullName phone email profileImage')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(properties);
  } catch (err) {
    next(err);
  }
};

// GET /api/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate('owner', 'username fullName phone email profileImage')
      .populate('tenant', 'username fullName phone email profileImage');

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Increment views
    await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// POST /api/properties
const createProperty = async (req, res, next) => {
  try {
    const propertyData = req.body;
    const ownerId = req.user?.id; // Assuming we have auth middleware

    if (!ownerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const property = await Property.create({
      ...propertyData,
      owner: ownerId
    });

    // Add property to owner's properties list
    await User.findByIdAndUpdate(ownerId, {
      $push: { properties: property._id }
    });

    const populatedProperty = await Property.findById(property._id)
      .populate('owner', 'username fullName phone email profileImage');

    res.status(201).json(populatedProperty);
  } catch (err) {
    next(err);
  }
};

// PUT /api/properties/:id
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;
    const updates = req.body;

    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('owner', 'username fullName phone email profileImage');

    res.json(updatedProperty);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;

    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    // Remove property from owner's properties list
    await User.findByIdAndUpdate(ownerId, {
      $pull: { properties: id }
    });

    await Property.findByIdAndDelete(id);

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET /api/properties/owner/:ownerId
const getOwnerProperties = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { owner: ownerId, isActive: true };
    if (status && status !== 'All') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties
};
