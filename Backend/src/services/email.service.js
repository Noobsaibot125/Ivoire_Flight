const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: process.env.MAIL_ENCRYPTION === 'ssl',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Send OTP code by email
 */
const sendOtpEmail = async (email, code) => {
  const mailOptions = {
    from: `"IvoireFlights" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Votre code de vérification IvoireFlights',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1C4CA5; font-size: 24px; margin: 0;">IvoireFlights</h1>
        </div>
        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 8px;">Votre code de vérification</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Utilisez le code ci-dessous pour vérifier votre adresse email. Ce code expire dans 10 minutes.
        </p>
        <div style="background: linear-gradient(135deg, #1C4CA5, #0ea5e9); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 900; color: #fff; letter-spacing: 12px;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">
          Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email OTP:', error);
    return false;
  }
};

module.exports = { sendOtpEmail };
