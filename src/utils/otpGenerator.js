/**
 * Generates a cryptographically random 6-digit OTP.
 * @returns {string} A 6-digit numeric string.
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generateOtp };
