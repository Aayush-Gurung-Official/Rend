const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary(req.user);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary
};

