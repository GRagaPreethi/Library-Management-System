require("dotenv").config();
const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library Management System API",
      version: "1.0.0",
      description:
        "REST API for managing a library — books, members, borrowing and returning — with JWT authentication and role-based access control.",
    },
    servers: [{ url: "http://localhost:" + (process.env.PORT || 5000) }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Books", description: "Book management" },
      { name: "Borrow", description: "Borrow and return books" },
      { name: "Members", description: "Member management" },
    ],
  },
  apis: ["./routes/*.js"],
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ success: true, message: "Library API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
  });
});
