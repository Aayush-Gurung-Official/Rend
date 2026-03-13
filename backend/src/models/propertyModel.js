const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    listingType: {
      type: String,
      enum: ['For Rent', 'For Sale', 'For Both'],
      required: true,
      default: 'For Rent'
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'House', 'Studio', 'Room', 'Villa', 'Land'],
      required: true,
    },
    bedrooms: {
      type: Number,
      default: null,
    },
    bathrooms: {
      type: Number,
      default: null,
    },
    squareFootage: {
      type: Number,
      required: true,
    },
    monthlyRent: {
      type: Number,
      default: null,
    },
    securityDeposit: {
      type: Number,
      default: null,
    },
    salePrice: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    leaseTerms: {
      type: String,
      default: '12 Months',
    },
    utilities: [{
      type: String,
    }],
    amenities: [{
      type: String,
    }],
    furnished: {
      type: String,
      enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
      default: 'Unfurnished'
    },
    parking: {
      type: String,
      enum: ['None', '1 Car', '2 Cars', 'More'],
      default: 'None'
    },
    floorNumber: {
      type: String,
      default: null,
    },
    totalFloors: {
      type: String,
      default: null,
    },
    yearBuilt: {
      type: String,
      default: null,
    },
    facingDirection: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'],
      default: 'North'
    },
    nearbyPlaces: {
      type: String,
      default: '',
    },
    images: [{
      type: String,
    }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Sold', 'Under Maintenance', 'Draft'],
      default: 'Available'
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }]
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
