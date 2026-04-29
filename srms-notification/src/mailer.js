const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '2525'),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const FROM = `"${process.env.MAIL_FROM_NAME || 'SRMS'}" <${process.env.MAIL_FROM_ADDRESS || 'srms@test.in'}>`;

async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'SRMS - OTP Verification',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1e293b">Your OTP Code</h2>
        <p style="color:#475569">Use the code below to verify your identity. It expires in 10 minutes.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0f172a">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

async function sendCompletionOtpEmail(to, otp, requestNumber) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'SRMS - Confirm Service Completion',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1e293b">Confirm Service Completion</h2>
        <p style="color:#475569">Your service request <strong>#${requestNumber}</strong> has been marked as complete.</p>
        <p style="color:#475569">Use the code below to confirm:</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0f172a">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail(to, name) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Welcome to SRMS',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1e293b">Welcome, ${name}!</h2>
        <p style="color:#475569">Your account has been created successfully. You can now log in and submit service requests.</p>
        <p style="color:#94a3b8;font-size:13px">— The SRMS Team</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail, sendCompletionOtpEmail, sendWelcomeEmail };
