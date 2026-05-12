# JWT Authentication API - Setup Guide

Welcome to the **JWT Authentication API** project! This repository contains a fully-fledged authentication system with email OTP verification and product management endpoints, built using Node.js, Express, and MongoDB.

This guide provides everything you need to get the project running on your local machine in just a few steps.

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js**: (Version 16.x or strictly higher recommended). You can download it from [nodejs.org](https://nodejs.org/).
- **NPM**: Node Package Manager (comes with Node.js).
- **MongoDB Database**: Either a local MongoDB instance running, or a connection string to a cloud database like MongoDB Atlas.
- **SMTP Account**: An email account (like Gmail) with an App Password configured for sending OTP and verification emails.

---

## 🚀 Quick Start Instructions

Follow these steps to get the server running locally:

### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone <repository-url-goes-here>
cd jwt-auth-project
```

### 2. Install Dependencies
Install all the required NPM packages by running:
```bash
npm install
```

### 3. Configure Environment Variables (CRITICAL STEP)
The project relies on a few sensitive credentials (like database URLs and secrets) to run securely. You need to provide these in an environment file.

1. Create a file named exactly **`.env`** in the root directory of the project (the same folder as `package.json`).
2. Copy and paste the following template into your newly created `.env` file.
3. Replace the placeholder values (the parts entirely in `< >`) with your actual credentials.

```env
# Server Configuration
PORT=5000

# Database Configuration (Replace with your actual MongoDB URI)
MONGODB_URI=<your_mongodb_connection_string_here>

# JWT Authentication
# You can generate a strong secret string or use a random one
JWT_SECRET=<your_strong_jwt_secret_key>
JWT_EXPIRES_IN=1d

# Email Configuration (Used for sending OTPs - Using Gmail as an example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Your email address that will send the OTPs
SMTP_USER=<your_email_address@gmail.com>

# Your email's App Password (NOT your regular account password)
# If using Gmail, you must generate a 16-character 'App Password' from your Google Account settings
SMTP_PASS=<your_16_character_app_password>
```

> **Note on Gmail SMTP**: To get an `SMTP_PASS` for Gmail, you must have 2-Step Verification enabled on your Google Account. Go to your Google Account Settings -> Security -> 2-Step Verification -> App Passwords to generate one.

### 4. Start the Application
Once your `.env` file is set up and saved, you're ready to start the server!

**For typical production/standard start:**
```bash
npm start
```

**For development (auto-restarts on code changes using nodemon):**
```bash
npm run dev
```

If everything is configured correctly, you should see the following logs in your terminal:
```
Server running on http://localhost:5000
Swagger docs at http://localhost:5000/api-docs
MongoDB connected successfully
```

---

## 📖 Testing the API (Swagger UI)

This project comes with built-in API documentation and a testing interface using Swagger. 

Once your server is running, you can explore and interact with all the API endpoints directly from your browser!

1. Open your web browser.
2. Navigate to: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
3. You can test all routes (Registration, Login, Adding Products, etc.) directly from this interface.

### Important Note on Protected Routes:
Any route marked with a padlock symbol in Swagger requires you to be logged in. 
1. Hit the `/api/auth/login` endpoint to get a token.
2. Copy the token.
3. Click the "Authorize" button at the top of the Swagger page, paste the token, and click Authorize.

Happy Coding! 🎉
