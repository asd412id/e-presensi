const { createSigner, createVerifier } = require('fast-jwt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Create signer and verifier instances
const signer = createSigner({
  key: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN
});

const verifier = createVerifier({
  key: JWT_SECRET
});

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return signer(payload);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  try {
    return verifier(token);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate refresh token with longer expiration
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  const refreshSigner = createSigner({
    key: JWT_SECRET,
    expiresIn: '7d'
  });
  return refreshSigner(payload);
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};