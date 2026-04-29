const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// ─── Registration by email ───
router.post('/register/email', authController.registerByEmail);

// ─── Registration by phone (3 steps) ───
router.post('/register/phone/send-otp', authController.registerPhoneSendOtp);
router.post('/register/phone/verify-otp', authController.registerPhoneVerifyOtp);
router.post('/register/phone/complete', authController.registerPhoneComplete);

// ─── Email verification ───
router.post('/verify-email', authController.verifyEmailOtp);

// ─── Resend OTP ───
router.post('/resend-otp', authController.resendOtp);

// ─── Login by email ───
router.post('/login/email', authController.loginByEmail);

// ─── Login by phone (password) ───
router.post('/login/phone', authController.loginByPhone);
router.post('/login/phone/send-otp', authController.loginPhoneSendOtp);
router.post('/login/phone/verify-otp', authController.loginPhoneVerifyOtp);

// ─── Protected routes ───
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
