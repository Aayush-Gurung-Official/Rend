const updateService = require('../services/updateService');

const updateProfile = async (req, res, next) => {
  try {
    const profile = await updateService.updateProfile(req.user, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await updateService.updateListing(req.user, req.params.id, req.body);
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  updateListing
};

