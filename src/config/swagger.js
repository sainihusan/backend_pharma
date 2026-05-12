const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Agent IDE Authentication API",
      version: "1.0.0",
      description:
        "Secure authentication API for signup, login, JWT authentication, email verification, and password reset.",
    },

    servers: [
      {
        url: "https://backend-pharma-g72l.onrender.com",
        description: "Production Server",
      },
      {
        url: "http://localhost:5000",
        description: "Local Server",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  // IMPORTANT FIX
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
