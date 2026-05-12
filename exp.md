# Comprehensive Codebase Documentation

This document provides an exhaustive, component-level explanation of the `jwt-auth-project` API. This API serves as a robust Authentication and Product Management system, leveraging Node.js, Express, and MongoDB.

## 1. Technology Stack & Core Dependencies
- **Runtime:** Node.js
- **Framework:** Express.js (REST API architecture)
- **Database:** MongoDB
- **ODM (Object Data Modeling):** Mongoose
- **Security & Authentication:** 
  - `jsonwebtoken` (JWT) for stateless session handling.
  - `bcryptjs` for secure password hashing.
  - `cors` for Cross-Origin Resource Sharing.
- **Data Validation:** `express-validator` (middleware-based input sanitization and logic checks).
- **Communication:** `nodemailer` for SMTP-based email transactions (OTPs).
- **Documentation:** `swagger-ui-express` & `swagger-jsdoc` for self-generating, interactive endpoint documentation.
- **Environment:** `dotenv` for secret management.

---

## 2. Project Architecture & Directory Structure
The application strictly adheres to the Model-View-Controller (MVC) pattern logic (without a frontend view) inside the `/src` directory:

- `/src/models/`: Contains Mongoose schemas mapping application data to MongoDB collections.
- `/src/controllers/`: Houses the core business logic. Extracts request data, interacts with Models/Services, and crafts HTTP responses.
- `/src/routes/`: Express routers that define the API endpoints, attach validation rules, and delegate to controllers.
- `/src/middlewares/`: Functions intercepted before controllers, primarily for JWT authentication and schema validation checks.
- `/src/services/`: Abstracted external implementations (e.g., reusable DB queries).
- `/src/utils/`: General-purpose helper functions and logic decoupling (e.g., mailer configurations, OTP generation).
- `/src/config/`: System bootstrap configurations (MongoDB connection strings, Swagger definitions).
- `/src/server.js`: The central entry point. Bootstraps Express, loads routes, configures globals, and initiates the DB connection. 

---

## 3. Database Models Deep-Dive

### A. User Model (`src/models/User.js`)
Manages the user lifecycle and authentication credentials.
- **`username`**: String, required, automatically trimmed.
- **`email`**: String, required, strictly lowercase and unique. Used as the primary login identifier.
- **`password`**: String, required. Stores the encrypted `bcrypt` hash, never plain text.
- **`dateOfBirth`**: Date, required.
- **`gender`**: String, required. Enforced by an enum array: `["male", "female", "others"]`.
- **`isVerified`**: Boolean, defaults to `false`. Flags whether the user has successfully completed the OTP email verification.
- **`otp`**: String. Temporarily holds a 6-digit numeric string during registration or password resets.
- **`otpExpires`**: Date. Represents the exact timestamp when the current OTP becomes invalid (usually 10 minutes from generation).
- **Timestamps**: Mongoose auto-manages `createdAt` and `updatedAt`.

### B. Product Model (`src/models/Product.js`)
Manages the marketplace or inventory items.
- **`user`**: `ObjectId` referencing the `User` model. Represents the creator/owner of the product.
- **`name`**: String, required, trimmed.
- **`description`**: String, required.
- **`price`**: Number, required. Must be numeric and strictly non-negative (`min: 0`).
- **`imageLink`**: String, required. Must be a valid URL and specifically enforced to contain the `unsplash.com` domain.
- **`category`**: String, required.
- **Timestamps**: Mongoose auto-manages `createdAt` and `updatedAt`.

---

## 4. Universal Middlewares

### `validationMiddleware.js`
A centralized error-handling interceptor for `express-validator`.
- Exposes a `validate` function.
- Evaluates the current Request context for validation queues.
- If errors are present, intercepts the request pipeline and immediately returns a `422 Unprocessable Entity` response, mapping out exactly which fields failed the checks.

### `authMiddleware.js`
Secures protected endpoints.
- Exposes `verifyToken`.
- Extracts the token from the `Authorization: Bearer <token>` header.
- Validates the token against the `JWT_SECRET`.
- If valid, decodes the token payload and attaches the user's ID to `req.user`.
- If missing, invalid, or expired, immediately terminates the request with a `401 Unauthorized` response.

---

## 5. API Routes & Controller Workflows

### A. Authentication API (`/api/auth`)
Complete suite of identity management endpoints.

1. **`POST /signup`**
   - **Validation:** Strict checks on email formatting and comprehensive password complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char).
   - **Logic:** Creates an unverified `User`, hashes the password, orchestrates an OTP generation, saves the OTP with an expiration date, and dispatches an email via `nodemailer`.

2. **`POST /verify-email`**
   - **Validation:** Requires email and exactly a 6-digit OTP.
   - **Logic:** Queries the DB, matches the OTP, ensures it hasn't expired. If valid, clears the OTP fields and flips `isVerified` to `true`.

3. **`POST /resend-verification-otp`**
   - **Logic:** Looks up an unverified user. Re-generates a fresh 6-digit OTP, updates the DB, and fires off a new email.

4. **`POST /login`**
   - **Validation:** Requires email and password.
   - **Logic:** Checks if the user exists and is `isVerified`. Uses `bcrypt.compare` against the stored hash. If successful, signs a JSON Web Token and returns it to the client.

5. **`POST /logout`**
   - **Protected Route.**
   - **Logic:** Standard endpoint to end the session (often handled client-side by destroying the JWT, but provided for completeness or blacklist implementation).

6. **`POST /forgot-password`**
   - **Logic:** Verifies email exists, generates a temporary reset OTP, sets an expiration window, and emails the user.

7. **`POST /reset-password`**
   - **Validation:** Enforces the same strong password requirements on `newPassword`.
   - **Logic:** Takes email, OTP, and new password. Validates the OTP. If valid, hashes the new password, updates the DB, and nullifies the OTP fields.

8. **`GET /me`**
   - **Protected Route.**
   - **Logic:** Fetches the authenticated user's profile details using the ID extracted from the JWT token.

9. **`GET /users`**
   - **Protected Route.**
   - **Logic:** Retrieves a list of registered users from the database.

### B. Product API (`/api/products`)
Core platform functionality for creating and listing products.

1. **`GET /`**
   - **Open Route** (No authentication).
   - **Logic:** Invokes `Product.find()` to fetch the entire dataset of products available in the application, completely irrespective of who created them. This is primarily public catalogue access.

2. **`POST /`**
   - **Protected Route.**
   - **Validation:** Validates numeric, non-negative `price`, proper `category`, and strict `unsplash.com` formatting for `imageLink`.
   - **Logic:** Attaches `req.user.id` to the payload and inserts a new product document, tying it permanently to the requesting user.

3. **`GET /mine`**
   - **Protected Route.**
   - **Logic:** Uses Mongoose to execute `Product.find({ user: req.user.id })`. Scopes the response exclusively to items created by the authenticated session.

4. **`GET /:id`**
   - **Validation:** Parameter validation ensures the `id` string matches the MongoDB `ObjectId` byte-format.
   - **Logic:** Uses `Product.findById(id)` to retrieve detailed data for a specific marketplace item.

---

## 6. App Configuration Details

- **`src/config/db.js`**: Reusable module leveraging `mongoose.connect()` asynchronously. It listens for the `MONGODB_URI` environment variable to connect the robust Express backend to the database.
- **`src/config/swagger.js`** / **Server integration**: Uses `swagger-jsdoc` to statically analyze route comments (structured as YAML within block comments) and builds an interactive UI served at `http://localhost:<PORT>/api-docs`.
- **`src/utils/mailer.js`**: An abstraction module configuring `nodemailer.createTransport()`. It utilizes standard SMTP connections relying on `.env` bindings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) to deliver critical security payloads like OTPs securely.
