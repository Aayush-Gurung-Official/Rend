const dashboardService = {
  // Simple placeholder summary – plug real data later
  getSummary: async (_user) => {
    return {
      totalListings: 0,
      activeChats: 0,
      unreadMessages: 0
    };
  }
};

module.exports = dashboardService;

