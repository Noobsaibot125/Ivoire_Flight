const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/email.service');
const { sendOtpSms } = require('../services/sms.service');
require('dotenv').config();

/* ─── Helper: generate 6-digit OTP ─── */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ─── Helper: generate JWT ─── */
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );

/* ===================================================================
   1. REGISTER BY EMAIL
   POST /api/auth/register/email
   Body: { firstName, lastName, email, password, phone? }
   =================================================================== */
exports.registerByEmail = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nom, prénom, email et mot de passe sont requis.' });
    }

    // Check existing
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ success: false, message: 'Ce numéro de téléphone est déjà utilisé.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || null,
      emailVerified: false,
      phoneVerified: false,
    });

    // Generate & send OTP for email verification
    const code = generateOtp();
    await Otp.create({
      identifier: email,
      code,
      type: 'email',
      purpose: 'register',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    await sendOtpEmail(email, code);

    return res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez votre email avec le code OTP envoyé.',
      userId: user.id,
    });
  } catch (error) {
    console.error('registerByEmail error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   2. REGISTER BY PHONE – Step 1: Send OTP
   POST /api/auth/register/phone/send-otp
   Body: { phone }
   =================================================================== */
exports.registerPhoneSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone requis.' });
    }

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Ce numéro est déjà utilisé.' });
    }

    // Invalidate previous OTPs for this phone
    await Otp.update({ used: true }, { where: { identifier: phone, type: 'phone', purpose: 'register', used: false } });

    const code = generateOtp();
    await Otp.create({
      identifier: phone,
      code,
      type: 'phone',
      purpose: 'register',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpSms(phone, code);

    return res.status(200).json({
      success: true,
      message: 'Code OTP envoyé par SMS.',
    });
  } catch (error) {
    console.error('registerPhoneSendOtp error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   3. REGISTER BY PHONE – Step 2: Verify OTP
   POST /api/auth/register/phone/verify-otp
   Body: { phone, code }
   =================================================================== */
exports.registerPhoneVerifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Téléphone et code requis.' });
    }

    const otpRecord = await Otp.findOne({
      where: {
        identifier: phone,
        code,
        type: 'phone',
        purpose: 'register',
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Code OTP invalide ou expiré.' });
    }

    otpRecord.used = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Numéro vérifié. Complétez votre profil.',
      phoneVerified: true,
    });
  } catch (error) {
    console.error('registerPhoneVerifyOtp error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   4. REGISTER BY PHONE – Step 3: Complete profile
   POST /api/auth/register/phone/complete
   Body: { phone, firstName, lastName, password, email? }
   =================================================================== */
exports.registerPhoneComplete = async (req, res) => {
  try {
    const { phone, firstName, lastName, password, email } = req.body;

    if (!phone || !firstName || !lastName || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone, nom, prénom et mot de passe sont requis.' });
    }

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Ce numéro est déjà utilisé.' });
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email || null,
      password: hashedPassword,
      phone,
      phoneVerified: true,
      emailVerified: false,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error('registerPhoneComplete error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   5. VERIFY EMAIL OTP (after email registration)
   POST /api/auth/verify-email
   Body: { email, code }
   =================================================================== */
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email et code requis.' });
    }

    const otpRecord = await Otp.findOne({
      where: {
        identifier: email,
        code,
        type: 'email',
        purpose: 'register',
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Code OTP invalide ou expiré.' });
    }

    otpRecord.used = true;
    await otpRecord.save();

    const user = await User.findOne({ where: { email } });
    if (user) {
      user.emailVerified = true;
      await user.save();
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error('verifyEmailOtp error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   6. RESEND OTP
   POST /api/auth/resend-otp
   Body: { identifier, type: 'email'|'phone', purpose: 'register'|'login' }
   =================================================================== */
exports.resendOtp = async (req, res) => {
  try {
    const { identifier, type, purpose } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({ success: false, message: 'Identifiant et type requis.' });
    }

    // Invalidate old OTPs
    await Otp.update({ used: true }, { where: { identifier, type, used: false } });

    const code = generateOtp();
    await Otp.create({
      identifier,
      code,
      type,
      purpose: purpose || 'register',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (type === 'email') {
      await sendOtpEmail(identifier, code);
    } else {
      await sendOtpSms(identifier, code);
    }

    return res.status(200).json({
      success: true,
      message: `Code OTP renvoyé par ${type === 'email' ? 'email' : 'SMS'}.`,
    });
  } catch (error) {
    console.error('resendOtp error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   7. LOGIN BY EMAIL
   POST /api/auth/login/email
   Body: { email, password }
   =================================================================== */
exports.loginByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error('loginByEmail error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   7b. LOGIN BY PHONE (password)
   POST /api/auth/login/phone
   Body: { phone, password }
   =================================================================== */
exports.loginByPhone = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis.' });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error('loginByPhone error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   8. LOGIN BY PHONE – Send OTP
   POST /api/auth/login/phone/send-otp
   Body: { phone }
   =================================================================== */
exports.loginPhoneSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone requis.' });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Aucun compte trouvé avec ce numéro.' });
    }

    // Invalidate old OTPs
    await Otp.update({ used: true }, { where: { identifier: phone, type: 'phone', purpose: 'login', used: false } });

    const code = generateOtp();
    await Otp.create({
      identifier: phone,
      code,
      type: 'phone',
      purpose: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpSms(phone, code);

    return res.status(200).json({
      success: true,
      message: 'Code OTP envoyé par SMS.',
    });
  } catch (error) {
    console.error('loginPhoneSendOtp error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   9. LOGIN BY PHONE – Verify OTP
   POST /api/auth/login/phone/verify-otp
   Body: { phone, code }
   =================================================================== */
exports.loginPhoneVerifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Téléphone et code requis.' });
    }

    const otpRecord = await Otp.findOne({
      where: {
        identifier: phone,
        code,
        type: 'phone',
        purpose: 'login',
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Code OTP invalide ou expiré.' });
    }

    otpRecord.used = true;
    await otpRecord.save();

    const user = await User.findOne({ where: { phone } });
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error('loginPhoneVerifyOtp error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   10. GET CURRENT USER (protected)
   GET /api/auth/me
   =================================================================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ===================================================================
   11. UPDATE PROFILE (protected)
   PUT /api/auth/profile
   Body: { firstName?, lastName?, email?, phone?, password? }
   =================================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
      }
      user.email = email;
      user.emailVerified = false;
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ success: false, message: 'Ce numéro est déjà utilisé.' });
      }
      user.phone = phone;
      user.phoneVerified = false;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
