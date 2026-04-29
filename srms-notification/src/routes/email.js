const express = require('express');
const router = express.Router();
const { requireServiceToken } = require('../middleware/auth');
const { sendOtpEmail, sendCompletionOtpEmail, sendWelcomeEmail } = require('../mailer');

// All email routes are internal — require shared service token
router.use(requireServiceToken);

// POST /email/send-otp
router.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(422).json({ error: 'email and otp are required' });
  }

  try {
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP email sent' });
  } catch (err) {
    console.error('[email] send-otp error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

// POST /email/send-completion-otp
router.post('/send-completion-otp', async (req, res) => {
  const { email, otp, request_number } = req.body;
  if (!email || !otp || !request_number) {
    return res.status(422).json({ error: 'email, otp, and request_number are required' });
  }

  try {
    await sendCompletionOtpEmail(email, otp, request_number);
    res.json({ message: 'Completion OTP email sent' });
  } catch (err) {
    console.error('[email] send-completion-otp error:', err.message);
    res.status(500).json({ error: 'Failed to send completion OTP email' });
  }
});

// POST /email/send-welcome
router.post('/send-welcome', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(422).json({ error: 'email and name are required' });
  }

  try {
    await sendWelcomeEmail(email, name);
    res.json({ message: 'Welcome email sent' });
  } catch (err) {
    console.error('[email] send-welcome error:', err.message);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

module.exports = router;
