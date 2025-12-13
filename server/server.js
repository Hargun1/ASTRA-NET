const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for Render deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow Render domains, localhost, and custom domains
    if (origin.includes('onrender.com') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('vercel.app') ||
        origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sendingemail80@gmail.com',
    pass: process.env.EMAIL_PASS || 'jtgi ymgq cuwx cruv'
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Store OTP with expiry
    otpStore.set(email, { otp, expiresAt });

    // Email template
    const mailOptions = {
      from: {
        name: 'ASTRA NET',
        address: 'sendingemail80@gmail.com'
      },
      to: email,
      subject: '🛰️ ASTRA NET - Your Access Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f23 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #ef4444, #f59e0b); border-radius: 50%; display: inline-block; box-shadow: 0 0 40px rgba(245, 158, 11, 0.5);"></div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 10px;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 8px; color: #ffffff;">ASTRA NET</h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 40px;">
                <p style="margin: 0; font-size: 12px; letter-spacing: 4px; color: #64748b; text-transform: uppercase;">Space Threat Monitoring System</p>
              </td>
            </tr>
            <tr>
              <td style="background: rgba(30, 30, 50, 0.8); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; padding: 40px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1)); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 20px 40px; margin: 20px 0;">
                  <h2 style="margin: 0; font-size: 48px; font-weight: 600; letter-spacing: 12px; color: #f59e0b; font-family: 'Courier New', monospace;">${otp}</h2>
                </div>
                <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b;">This code expires in <strong style="color: #f59e0b;">5 minutes</strong></p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 40px;">
                <p style="margin: 0; font-size: 12px; color: #475569;">If you didn't request this code, please ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 30px; border-top: 1px solid rgba(100, 116, 139, 0.2); margin-top: 30px;">
                <p style="margin: 20px 0 0 0; font-size: 11px; color: #475569;">© 2025 ASTRA NET • Indian Space Research Organisation</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const storedData = otpStore.get(email);

  if (!storedData) {
    return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }

  // OTP verified successfully
  otpStore.delete(email);
  console.log(`✅ OTP verified for ${email}`);
  
  res.json({ 
    success: true, 
    message: 'OTP verified successfully',
    user: { email }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'ASTRA NET Backend API',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/send-otp', '/api/verify-otp']
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'ASTRA NET Server is running', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

// Start server - bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║      🛰️  ASTRA NET Server Running               ║
  ║         Port: ${PORT}                              ║
  ║         Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║         Status: Online                           ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
  `);
});
