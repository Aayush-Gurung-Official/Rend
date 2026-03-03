const updateService = {
  updateProfile: async (user, payload) => {
    // In a real implementation, persist changes to the DB
    return {
      ...user,
      ...payload
    };
  },

  updateListing: async (_user, id, payload) => {
    // Wire to listingService or DB later
    return {
      id,
      ...payload
    };
  }
};

module.exports = updateService;

