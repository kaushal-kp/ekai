const logger = require('../config/logger');

/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 * Uses in-memory storage for development (Redis for production)
 */

// In-memory OTP storage (development only)
const otpStore = new Map();

/**
 * Generate a random OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to phone number
 * For MVP, OTP is stored in memory and logged
 *
 * @param {string} phone - Phone number to send OTP to
 * @returns {Promise<Object>} OTP delivery confirmation
 */
const sendOTP = async (phone) => {
  try {
    const otp = generateOTP();
    const expiryTime = Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;
    const attempts = 0;
    const maxAttempts = 3;

    // Store OTP with metadata
    otpStore.set(phone, {
      otp,
      expiryTime,
      attempts,
      maxAttempts,
      createdAt: new Date(),
    });

    logger.info('OTP generated and stored', {
      phone,
      expiryMinutes: process.env.OTP_EXPIRY_MINUTES || 5,
    });

    // In production, send OTP via SMS gateway
    logger.debug('Mock OTP sent', { phone, otp });

    return {
      success: true,
      message: 'OTP sent successfully',
      phone,
      expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || 5),
    };
  } catch (error) {
    logger.error('Failed to send OTP', {
      phone,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Verify OTP provided by user
 *
 * @param {string} phone - Phone number
 * @param {string} otp - OTP provided by user
 * @returns {Promise<Boolean>} True if OTP is valid
 */
const verifyOTP = async (phone, otp) => {
  try {
    const storedData = otpStore.get(phone);

    if (!storedData) {
      throw new Error('No OTP found for this phone number');
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(phone);
      throw new Error('OTP has expired');
    }

    // Check attempt limit
    if (storedData.attempts >= storedData.maxAttempts) {
      otpStore.delete(phone);
      throw new Error('Maximum OTP verification attempts exceeded');
    }

    // Check if OTP matches
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      logger.warn('Invalid OTP attempt', {
        phone,
        attempts: storedData.attempts,
        maxAttempts: storedData.maxAttempts,
      });
      throw new Error('Invalid OTP');
    }

    // OTP is valid, clean up
    otpStore.delete(phone);

    logger.info('OTP verified successfully', { phone });

    return true;
  } catch (error) {
    logger.error('OTP verification failed', {
      phone,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Resend OTP
 * Generates new OTP and invalidates previous one
 *
 * @param {string} phone - Phone number
 * @returns {Promise<Object>} OTP resend confirmation
 */
const resendOTP = async (phone) => {
  try {
    // Clear previous OTP
    otpStore.delete(phone);

    // Send new OTP
    return await sendOTP(phone);
  } catch (error) {
    logger.error('Failed to resend OTP', {
      phone,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Clear OTP for phone (e.g., after successful login)
 *
 * @param {string} phone - Phone number
 */
const clearOTP = (phone) => {
  otpStore.delete(phone);
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  clearOTP,
};
