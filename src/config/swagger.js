const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Agent IDE Authentication API",
      version: "1.0.0",
      description:
        "Secure authentication API for the Agent IDE application. Supports signup, login, JWT authentication, email verification, and password reset APIs.",
    },

    servers: [
      {
        url: "https://backend-pharma-g72l.onrender.com",
        description: "Render Production Server",
      },
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
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

      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Operation completed successfully",
            },

            data: {
              type: "object",
              nullable: true,
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },

            message: {
              type: "string",
              example: "Something went wrong",
            },

            data: {
              type: "object",
              nullable: true,
            },
          },
        },
      },
    },

    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  // IMPORTANT
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
