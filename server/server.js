const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for Render deployment
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('onrender.com') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('vercel.app') ||
        origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Store OTPs temporarily
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send email using Resend API (works on Render free tier)
async function sendEmailWithResend(to, otp) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'ASTRA NET <onboarding@resend.dev>',
      to: [to],
      subject: '🚀 ASTRA NET - Your Access Code',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 80px; height: 80px; background: radial-gradient(circle, #ffd93d 0%, #ff9500 50%, #ff6b00 100%); border-radius: 50%;"></div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 5px; letter-spacing: 8px;">ASTRA NET</h1>
              <p style="color: #4ecdc4; font-size: 11px; letter-spacing: 3px;">ADVANCED SPACE THREAT RESPONSE & ANALYSIS</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px 30px; text-align: center;">
              <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Your secure access code is:</p>
              
              <div style="background: linear-gradient(135deg, rgba(78,205,196,0.1) 0%, rgba(78,205,196,0.05) 100%); border: 2px solid rgba(78,205,196,0.3); border-radius: 16px; padding: 25px; margin: 20px 0;">
                <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #4ecdc4; font-family: monospace;">${otp}</span>
              </div>
              
              <p style="color: rgba(255,255,255,0.4); font-size: 12px;">
                ⏱️ This code expires in <strong style="color: #ff6b6b;">5 minutes</strong>
              </p>
            </div>
            
            <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center; margin-top: 30px;">
              🔐 Secure transmission via ISRO servers
            </p>
          </div>
        </body>
        </html>
      `
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return await response.json();
}

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

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check cooldown
    const existingOTP = otpStore.get(email);
    if (existingOTP && Date.now() - existingOTP.createdAt < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - existingOTP.createdAt)) / 1000);
      return res.status(429).json({ 
        success: false, 
        message: `Please wait ${remaining} seconds before requesting a new OTP` 
      });
    }

    const otp = generateOTP();
    
    // Store OTP
    otpStore.set(email, {
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send email
    await sendEmailWithResend(email, otp);
    
    console.log(`✅ OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully! Check your email.' });

  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  try {
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

    otpStore.delete(email);
    console.log(`✅ OTP verified for ${email}`);
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: { email }
    });

  } catch (error) {
    console.error('❌ Error verifying OTP:', error.message);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// Cleanup expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) otpStore.delete(email);
  }
}, 5 * 60 * 1000);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ASTRA NET Backend running on port ${PORT}`);
});
