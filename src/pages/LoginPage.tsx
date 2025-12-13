import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../styles/LoginPage.css';

// Stunning 3D-like orbital animation background
const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Stars
    const stars: Array<{ x: number; y: number; size: number; speed: number; opacity: number }> = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.02 + 0.005,
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    // Orbital rings
    const orbits = [
      { radius: 180, speed: 0.0003, color: 'rgba(78, 205, 196, 0.12)', width: 1 },
      { radius: 280, speed: -0.0002, color: 'rgba(212, 180, 117, 0.08)', width: 1.5 },
      { radius: 380, speed: 0.00015, color: 'rgba(139, 92, 246, 0.06)', width: 1 },
    ];

    // Satellites on orbits
    const satellites = [
      { orbit: 0, angle: 0, size: 4, color: '#4ecdc4' },
      { orbit: 0, angle: Math.PI, size: 3, color: '#4ecdc4' },
      { orbit: 1, angle: Math.PI / 2, size: 5, color: '#d4b475' },
      { orbit: 2, angle: 0, size: 3, color: '#8b5cf6' },
      { orbit: 2, angle: Math.PI * 1.3, size: 4, color: '#8b5cf6' },
    ];

    let time = 0;
    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#030608';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle radial gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
      gradient.addColorStop(0, 'rgba(78, 205, 196, 0.03)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw twinkling stars
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.speed * 100) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      // Draw orbital rings
      orbits.forEach((orbit, i) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbit.radius, 0, Math.PI * 2);
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = orbit.width;
        ctx.stroke();

        // Dashed secondary ring
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbit.radius + 20, 0, Math.PI * 2);
        ctx.strokeStyle = orbit.color.replace(/[\d.]+\)$/, '0.03)');
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw and animate satellites
      satellites.forEach(sat => {
        const orbit = orbits[sat.orbit];
        sat.angle += orbit.speed * 60;
        const x = centerX + Math.cos(sat.angle) * orbit.radius;
        const y = centerY + Math.sin(sat.angle) * orbit.radius;

        // Glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, sat.size * 4);
        glowGradient.addColorStop(0, sat.color + '60');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - sat.size * 4, y - sat.size * 4, sat.size * 8, sat.size * 8);

        // Satellite
        ctx.beginPath();
        ctx.arc(x, y, sat.size, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.fill();
      });

      // Central sun glow
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 120);
      sunGlow.addColorStop(0, 'rgba(212, 180, 117, 0.15)');
      sunGlow.addColorStop(0.3, 'rgba(212, 180, 117, 0.05)');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(centerX - 150, centerY - 150, 300, 300);

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmic-canvas" />;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { otpSent, setOtpSent, login } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true, email);
        setCountdown(60);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      });

      const data = await response.json();

      if (data.success) {
        login({
          email,
          name: email.split('@')[0],
        });
        navigate('/loading');
      } else {
        setError(data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Unable to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Unable to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <CosmicBackground />
      
      {/* Floating grid lines */}
      <div className="grid-overlay" />
      
      {/* Main content */}
      <div className="login-wrapper">
        {/* Left side - Branding */}
        <motion.div 
          className="brand-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="brand-content">
            {/* Animated Logo */}
            <div className="logo-wrapper">
              <div className="logo-rings">
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
              </div>
              <div className="logo-core">
                <div className="core-inner" />
                <div className="core-pulse" />
              </div>
              <div className="orbit-dot dot-1" />
              <div className="orbit-dot dot-2" />
              <div className="orbit-dot dot-3" />
            </div>

            <h1 className="brand-title">
              <span className="title-line">ASTRA</span>
              <span className="title-line accent">NET</span>
            </h1>
            
            <p className="brand-tagline">
              Advanced Space Threat Response & Analysis Network
            </p>

            <div className="brand-features">
              <div className="feature">
                <div className="feature-icon">☀️</div>
                <span>Solar Monitoring</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🌍</div>
                <span>Earth Hazards</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🛰️</div>
                <span>Orbital Tracking</span>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <span className="powered-by">Powered by</span>
            <span className="isro-text">ISRO</span>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div 
          className="form-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          <div className="form-card">
            <div className="card-header">
              <div className="status-indicator">
                <span className="status-dot" />
                <span>System Online</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.form
                  key="email-form"
                  className="auth-form"
                  onSubmit={handleEmailSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="form-header">
                    <h2>Access Portal</h2>
                    <p>Enter your credentials to access the command center</p>
                  </div>

                  <div className="input-field">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container">
                      <div className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="commander@astra.net"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                      <div className="input-glow" />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="error-alert"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    <span className="btn-bg" />
                    <span className="btn-content">
                      {isLoading ? (
                        <span className="loader" />
                      ) : (
                        <>
                          <span>Send OTP</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </>
                      )}
                    </span>
                  </button>

                  <div className="security-note">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                    <span>256-bit encrypted connection</span>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  className="auth-form"
                  onSubmit={handleOtpSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="form-header">
                    <h2>Verification</h2>
                    <p>Enter the 6-digit code sent to <strong>{email}</strong></p>
                  </div>

                  <div className="otp-field">
                    <div className="otp-inputs">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`otp-digit ${digit ? 'filled' : ''}`}
                          disabled={isLoading}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="error-alert"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    <span className="btn-bg" />
                    <span className="btn-content">
                      {isLoading ? (
                        <span className="loader" />
                      ) : (
                        <>
                          <span>Verify & Enter</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </>
                      )}
                    </span>
                  </button>

                  <div className="otp-actions">
                    {countdown > 0 ? (
                      <span className="countdown">Resend in {countdown}s</span>
                    ) : (
                      <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={isLoading}>
                        Resend Code
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="change-email-btn"
                      onClick={() => {
                        setOtpSent(false, '');
                        setOtp(['', '', '', '', '', '']);
                        setError('');
                      }}
                    >
                      Change Email
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="card-footer">
              <div className="secure-hint">
                <span>🔐 Secure OTP verification via ISRO servers</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
