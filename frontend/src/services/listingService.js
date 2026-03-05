import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof __API_URL__ !== "undefined" ? __API_URL__ : "http://localhost:5000");

export const fetchListings = async (filters) => {
  const params = {};
  if (filters.type && filters.type !== "all") params.type = filters.type;
  if (filters.city) params.city = filters.city;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;

  const res = await axios.get(`${API_URL}/api/listings`, { params });
  return res.data;
};

