import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof __API_URL__ !== "undefined" ? __API_URL__ : "http://localhost:5000");

export const signup = async ({ username, password }) => {
  const res = await axios.post(`${API_URL}/api/auth/signup`, {
    username,
    password,
  });
  return res.data;
};

export const login = async ({ username, password }) => {
  const res = await axios.post(`${API_URL}/api/auth/login`, {
    username,
    password,
  });
  return res.data;
};

export const updateProfile = async ({ id, username, profileImage }) => {
  const res = await axios.patch(`${API_URL}/api/auth/profile`, {
    id,
    username,
    profileImage,
  });
  return res.data;
};

