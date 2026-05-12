require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/db");
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cors = require("cors");
const app = express();

// -- Body parsing ---------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*'
  }),
);
// -- Swagger UI -----------------------------------------------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -- Routes ---------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// -- Health check ---------------------------------------------
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Agent IDE Auth API is running",
    data: { docs: "/api-docs" },
  });
});

// -- 404 handler ----------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});

// -- Global error handler --------------------------------------
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
});

// -- Start server ---------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});
