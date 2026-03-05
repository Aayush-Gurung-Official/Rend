const path = require("path");

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  uploadDir: path.join(__dirname, "..", "upload"),
};

module.exports = config;

