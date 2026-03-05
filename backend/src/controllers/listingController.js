const {
  getAllListings,
  getFeaturedListings,
} = require("../models/listingModel");

const listListings = (req, res, next) => {
  try {
    const listings = getAllListings(req.query);
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

const listFeaturedListings = (req, res, next) => {
  try {
    const listings = getFeaturedListings();
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listListings,
  listFeaturedListings,
};

