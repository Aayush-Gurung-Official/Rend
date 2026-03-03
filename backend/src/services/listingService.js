const Listing = require('../models/Listing');

// Temporary in-memory store
const listings = [];

const getAll = async (_query) => {
  return listings;
};

const getById = async (id) => {
  return listings.find((l) => String(l.id) === String(id)) || null;
};

const create = async (user, payload) => {
  const listing = new Listing({
    id: listings.length + 1,
    ownerId: user?.id || null,
    title: payload.title,
    type: payload.type || 'rent',
    price: payload.price || 0,
    location: payload.location || ''
  });
  listings.push(listing);
  return listing;
};

const update = async (_user, id, payload) => {
  const listing = listings.find((l) => String(l.id) === String(id));
  if (!listing) {
    return null;
  }
  Object.assign(listing, payload);
  return listing;
};

const remove = async (_user, id) => {
  const idx = listings.findIndex((l) => String(l.id) === String(id));
  if (idx >= 0) {
    listings.splice(idx, 1);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

