const tokenService = require('../services/tokenService');
const ApiError = require('../utils/ApiError');

const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const user = await tokenService.verifyAccessToken(token);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireAuth
};

