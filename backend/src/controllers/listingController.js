const listingService = require('../services/listingService');

const getAllListings = async (req, res, next) => {
  try {
    const listings = await listingService.getAll(req.query);
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await listingService.getById(req.params.id);
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

const createListing = async (req, res, next) => {
  try {
    const listing = await listingService.create(req.user, req.body);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await listingService.update(req.user, req.params.id, req.body);
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    await listingService.remove(req.user, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};

