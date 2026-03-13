const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const listingsRouter = require("./routes/listings");
const authRouter = require("./routes/auth");
const propertyRouter = require("./routes/propertyRoutes");
const tenantRouter = require("./routes/tenantRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const maintenanceRouter = require("./routes/maintenanceRoutes");
const agreementRouter = require("./routes/agreementRoutes");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    name: "Rend API",
    message: "Nepal house buy, sell and rent finder API",
  });
});

app.use("/api/listings", listingsRouter);
app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/tenants", tenantRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/agreements", agreementRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Rend backend running on port ${PORT}`);
});
