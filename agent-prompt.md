Create a production-ready Authentication and Product Management API built with Node.js, Express, and MongoDB (using Mongoose). The project should follow a clean MVC structure inside a `src` folder. 

Here are the strict requirements for the AI to follow:

### 1. Technology Stack & Dependencies
- **Framework**: Node.js with Express.js
- **Database**: MongoDB using Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) and `bcryptjs` for password hashing
- **Validation**: `express-validator`
- **Email Service**: `nodemailer` (for sending OTPs)
- **API Documentation**: `swagger-ui-express` and `swagger-jsdoc`
- **Utilities**: `dotenv` (for environment variables), `cors`, `nodemon` (for dev script)

### 2. Project Structure
Create the following directory structure inside the root:
- `/src/models/` (Mongoose DB Schemas)
- `/src/controllers/` (Business Logic)
- `/src/routes/` (Express Routers with express-validator checks)
- `/src/middlewares/` (Auth & Validation interceptors)
- `/src/services/` (Nodemailer email service)
- `/src/config/` (DB connection and Swagger config)
- `/src/utils/` (Helper functions if needed)
- `/src/server.js` (The main entry point)

### 3. Database Models Overview
**A. User Model (`src/models/User.js`)**
- `username` (String, required, trimmed)
- `email` (String, required, unique, lowercase, trimmed)
- `password` (String, required)
- `dateOfBirth` (Date, required)
- `gender` (String, required, enum: ["male", "female", "others"])
- `isVerified` (Boolean, default: false)
- `otp` (String, default: null)
- `otpExpires` (Date, default: null)
- Add schema timestamps.

**B. Product Model (`src/models/Product.js`)**
- `user` (ObjectId, ref: 'User', required)
- `name` (String, required, trimmed)
- `description` (String, required)
- `price` (Number, required, min: 0)
- `imageLink` (String, required, must validate as a URL containing "unsplash.com")
- `category` (String, required)
- Add schema timestamps.

### 4. Middlewares Overview
- **`src/middlewares/validationMiddleware.js`**: Create a `validate` function that runs `validationResult(req)` from `express-validator`. If errors exist, return a 422 Unprocessable Entity response with the error details.
- **`src/middlewares/authMiddleware.js`**: Create a `verifyToken` function that extracts the JWT from the `Authorization: Bearer <token>` header, verifies it using `process.env.JWT_SECRET`, and attaches the decoded user ID to `req.user`. Return 401 if unauthorized.

### 5. API Routes & Controllers
Implement the following routes and controller logic. **Every validation requirement must be strictly enforced using `express-validator` at the route level.** Ensure all routes are documented using inline Swagger JSDoc comments.

**A. Authentication Routes (`/api/auth`)**
1. `POST /signup`: 
   - Body requires: username, dateOfBirth (YYYY-MM-DD), gender, email, password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char).
   - Logic: Hashes password, creates unverified user, generates a 6-digit OTP, saves OTP + expiration (e.g., 10 mins) to DB, and sends the OTP via email using nodemailer.
2. `POST /verify-email`:
   - Body requires: email, otp (exactly 6 digits).
   - Logic: Finds user, verifies OTP matches and is not expired. Sets `isVerified` to true, clears OTP fields.
3. `POST /resend-verification-otp`:
   - Body requires: email.
   - Logic: Generates a new OTP for an unverified user and emails it.
4. `POST /login`:
   - Body requires: email, password.
   - Logic: Finds user. Rejects if `isVerified` is false. Compares bcrypt password. Generates and returns a JWT token.
5. `POST /logout`:
   - Requires Token. (Implement standard/placeholder logout logic).
6. `POST /forgot-password`:
   - Body requires: email.
   - Logic: Generates new 6-digit reset OTP, saves to user, and emails it.
7. `POST /reset-password`:
   - Body requires: email, otp, newPassword (must match strong password rules).
   - Logic: Verifies OTP. Hashes `newPassword` and saves.
8. `GET /me`:
   - Requires Token. Returns the authenticated user's profile details.
9. `GET /users`:
   - Requires Token. Returns a list of all users.

**B. Product Routes (`/api/products`)**
1. `GET /`:
   - Open Route.
   - Logic: Fetches all products available in the database irrespective of owner.
2. `POST /`:
   - Requires Token. 
   - Body requires: name, description, price (must be numeric and >= 0), imageLink (must be an unsplash.com URL), category.
   - Logic: Creates a product and links it to `req.user.id`.
3. `GET /mine`:
   - Requires Token.
   - Logic: Fetches all products where `user` matches `req.user.id`.
4. `GET /:id`:
   - Route param requires: id (must be valid MongoId).
   - Logic: Fetches a specific product by ID.

### 6. App Configuration & Boilerplate
- **Server Entry (`src/server.js`)**: Initialize Express, use CORS, parse JSON body, setup Swagger UI at `/api-docs` using the JSDoc comments from the routes, mount the `/api/auth` and `/api/products` routers, connect to DB, and start listening on `process.env.PORT`. Include global error handling.
- **DB Connection (`src/config/db.js`)**: Use mongoose to connect to `process.env.MONGODB_URI`.
- **Email Service (`src/services/emailService.js`)**: Configure a generic Nodemailer transporter using `process.env.SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`.

### 7. Actions for the AI
1. Generate `package.json` with all required dependencies and start/dev scripts.
2. Generate all the directories and files strictly following the code logic provided above.
3. **Important Instructions for the Human Output**: When finished generating the code, output clear instructions for the user advising them that the ONLY thing they need to do is run `npm install`, create a `.env` file with `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`, and run `npm run dev`.
