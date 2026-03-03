const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Temporary in-memory store for scaffold purposes
const users = [];

const register = async ({ name, email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new ApiError(409, 'User already exists');
  }

  const user = new User({
    id: users.length + 1,
    name: name || email.split('@')[0],
    email
  });
  users.push(user);

  return { user, token: 'mock-token' };
};

const login = async ({ email, password }) => {
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return { user, token: 'mock-token' };
};

// No-op for now
const logout = async () => {};

const getCurrentUser = async (currentUser) => {
  if (!currentUser) {
    throw new ApiError(401, 'Not authenticated');
  }
  return currentUser;
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};

