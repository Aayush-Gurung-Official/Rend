// Minimal mock token service – replace with real JWT implementation later.

const verifyAccessToken = async (token) => {
  // For now, trust any non-empty token and return a demo user.
  return {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    token
  };
};

module.exports = {
  verifyAccessToken
};

