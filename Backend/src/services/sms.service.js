const axios = require('axios');
require('dotenv').config();

/**
 * Send OTP code via SMS using 1SMSAfrica (Yellika) API
 */
const sendOtpSms = async (phone, code) => {
  try {
    const response = await axios.post(
      `${process.env.YELLIKA_API_URL}sms/send`,
      {
        recipient: phone,
        sender_id: process.env.YELLIKA_SENDER_ID,
        message: `Votre code de verification IvoireFlights est : ${code}. Il expire dans 10 minutes.`,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELLIKA_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    console.log(`OTP SMS envoyé à ${phone}`, response.data);
    return true;
  } catch (error) {
    console.error('Erreur envoi SMS OTP:', error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendOtpSms };
