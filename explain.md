# Project Codebase Explanation - Deep Dive

This document provides a highly detailed, component-level breakdown of the `jwt-auth-project` codebase. The application is a secure Authentication API with a Product Management feature, built using **Node.js, Express, and MongoDB (via Mongoose)**. 

The project strictly follows the **Model-View-Controller (MVC)** architectural pattern, focusing on clear separation of concerns, robust input validation, and secure user handling.

---

## 🏗️ 1. Root and Entry Point

### `package.json`
Manages the project's dependencies and scripts.
- **Dependencies Include**: `express` (framework), `mongoose` (DB ORM), `jsonwebtoken` (Auth Tokens), `bcryptjs` (Password Hashing), `express-validator` (Input Validation), `nodemailer` (Email Sending), `swagger-ui-express` & `swagger-jsdoc` (API Documentation).
- **Scripts**: 
  - `npm start`: Runs the app via Node.
  - `npm run dev`: Runs the app using `nodemon` for hot-reloading.

### `src/server.js`
The central hub of the application where the Express app is initialized and configured.
- **Middleware Initialization**: Enables CORS (`cors`), parses incoming JSON (`express.json()`), and URL-encoded data.
- **Swagger Documentation**: Loads the Swagger spec and serves a UI interface at `/api-docs`.
- **Routing Setup**: Mounts API routes at `/api/auth` (Auth API) and `/api/products` (Product API).
- **Health Check & Error Handling**: Provides a `/` root health-check, a 404 handler for missing routes, and a global error handling middleware for handling 500 internal server errors.
- **Bootstrapping**: First establishes a connection to MongoDB (via `connectDB()`), then starts the server on the configured port.

---

## 🗄️ 2. The Data Layer (`src/models`)

The models define how data is structured, validated, and related within MongoDB.

### `User.js`
Defines the structure for storing user data.
- **Fields**: 
  - `username` (required, string)
  - `email` (required, unique, lowercase string)
  - `password` (required, string - will store a bcrypt hash)
  - `dateOfBirth` (required, Date format)
  - `gender` (required enum: `male`, `female`, `others`)
  - `isVerified` (boolean, defaults to `false`. Used for email OTP workflow)
  - `otp` & `otpExpires` (stores the 6-digit verification code and its expiration timestamp)
- **Settings**: Explicitly includes `timestamps: true` to track `createdAt` and `updatedAt`.

### `Product.js`
Defines the structure for items users can post or view.
- **Fields**:
  - `user`: References an `ObjectId` from the `User` model, linking a product to its creator.
  - `name`, `description`, `category` (required strings, trimmed).
  - `price` (required Number, with validation ensuring it is not negative `min: [0]`).
  - `imageLink` (required String, regex match validating it as a strict URL).
- **Settings**: Also includes automatic timestamps.

---

## 🚦 3. The Routing Layer (`src/routes`)

Routes act as the entry traffic controllers. They define the HTTP endpoints, parse parameters, apply validation chains via `express-validator`, and route the request to the correct controller.

### `authRoutes.js`
Responsible for defining all endpoints starting with `/api/auth`.
- **`POST /api/auth/signup`**: Validates comprehensive user fields (e.g., strong password checks with upper, lower, numeric, and special characters).
- **`POST /api/auth/verify-email`**: Takes an `email` and 6-digit `otp`.
- **`POST /api/auth/resend-verification-otp`**: Reprovisions a new OTP for an `email`.
- **`POST /api/auth/login`**: Takes `email` and `password`. Validates them.
- **`POST /api/auth/logout`**: A protected route (requires token) to handle sign-outs.
- **`POST /api/auth/forgot-password` / `reset-password`**: Two-part protected flow for lost passwords using an emailed OTP.
- **`GET /api/auth/me`**: Protected route fetching the currently authenticated user's profile.
- **`GET /api/auth/users`**: Protected route to fetch a list of users.

### `productRoutes.js`
Responsible for defining all endpoints starting with `/api/products`.
- **`GET /api/products/`**: Open route. Retrieves all products available in the database irrespective of owner.
- **`POST /api/products/`**: Protected route (requires token). Specifically validates that `price` is not negative and that the `imageLink` is a valid `unsplash.com` URL. Creates a product tied to the logged-in user.
- **`GET /api/products/mine`**: Protected route. Retrieves products linked directly to the authenticated user.
- **`GET /api/products/:id`**: Open or protected route (varies). Uses `param` validation to ensure the `:id` is a valid MongoDB ObjectId before querying.

---

## 🧠 4. The Business Logic (`src/controllers`)

Controllers are invoked by the routes. They execute the core app operations: interacting with Models (DB) and returning a standard JSON response to the client.

### `authController.js`
Handles the complex workflows around accounts:
- **Registration Flow**: Hashes passwords using `bcrypt` before saving. Uses the email service to send out the generated 6-digit OTP.
- **Verification Flow**: Compares incoming OTP to DB OTP and expiration date. Updates `isVerified` flag.
- **Login Flow**: Checks if the user is verified, verifies `bcrypt` password match, and signs a JWT (JSON Web Token) containing user ID info.
- **Reset Flow**: Generates a temporary reset OTP, sends email, and upon valid submission, hashes the new password and updates the user.

### `productController.js`
Handles CRUD logic for the marketplace payload:
- **Creating Products**: Assigns `req.user.id` (inserted by middleware) to the `product.user` field to maintain association.
- **Retrieving Products**: Runs Mongoose queries like `Product.find()` (for all products), `Product.find({ user: req.user.id })` (for user's products), or `Product.findById(id)`.

---

## 🛡️ 5. The Interceptors (`src/middlewares`)

Functions that execute before the controller, crucial for security and data integrity.

### `authMiddleware.js`
Contains `verifyToken`. It parses the HTTP `Authorization: Bearer <token>` header, decodes the JWT signature using the `.env` secret, and extracts the User ID. If the token is invalid or expired, it immediately terminates the request with a `401 Unauthorized`. It attaches the current user to the `req` object for the controllers to consume.

### `validationMiddleware.js`
Contains the `validate` function. In routes, we pass an array of `express-validator` checks. This middleware runs `validationResult(req)`. If any checks failed (e.g., weak password, missing field), it immediately returns a `422 Unprocessable Entity` response with the exact field errors without hitting the database.

---

## 🔧 6. Supporting Utilities

- **`src/config/`**: 
  - `db.js`: Contains the logic using `mongoose.connect()` to connect optimally to the MongoDB cluster.
  - `swagger.js`: Sets up the dynamic API documentation engine.
- **`src/services/`**: (e.g., `emailService.js`) Encapsulates third-party logic. Specifically uses `nodemailer` configured with SMTP (usually Gmail or SendGrid) to dispatch OTPs without cluttering the Controllers.
- **`src/utils/`**: Reusable generic helper methods, such as token generators, error response standardizers, etc.
