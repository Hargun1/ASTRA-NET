import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PlanetBackground from '../components/PlanetBackground';
import NASADataPanel from '../components/NASADataPanel';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import '../styles/Dashboard.css';

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unifiedThreatScore, calculateUnifiedScore } = useDataStore();
  const [displayScore, setDisplayScore] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'M2.5 Solar Flare detected - monitoring in progress', time: '2 min ago' },
    { id: 2, type: 'alert', message: 'Conjunction alert: INSAT-3D proximity warning', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Heatwave advisory issued for Rajasthan', time: '1 hour ago' },
  ]);
  const [isDataRefreshing, setIsDataRefreshing] = useState(false);
  const [showNASAPanel, setShowNASAPanel] = useState(false);

  // Welcome animation dismiss
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Simulate live data updates
  useEffect(() => {
    const dataInterval = setInterval(() => {
      setIsDataRefreshing(true);
      setTimeout(() => {
        calculateUnifiedScore();
        setIsDataRefreshing(false);
      }, 500);
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(dataInterval);
  }, [calculateUnifiedScore]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;
      
      switch (e.key.toLowerCase()) {
        case '1':
          navigate('/aditya');
          break;
        case '2':
          navigate('/bhumi');
          break;
        case '3':
          navigate('/kaksha');
          break;
        case 'n':
          setShowNotification(prev => !prev);
          break;
        case 'l':
          setShowNASAPanel(prev => !prev);
          break;
        case 'escape':
          setShowNotification(false);
          setShowNASAPanel(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  useEffect(() => {
    // Animate score counting up
    const target = unifiedThreatScore;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [unifiedThreatScore]);

  const getThreatLevel = (score: number): { level: string; color: string } => {
    if (score < 20) return { level: 'LOW', color: '#10b981' };
    if (score < 40) return { level: 'GUARDED', color: '#84cc16' };
    if (score < 60) return { level: 'ELEVATED', color: '#f59e0b' };
    if (score < 80) return { level: 'HIGH', color: '#ef4444' };
    return { level: 'CRITICAL', color: '#dc2626' };
  };

  const threatInfo = getThreatLevel(displayScore);

  const modules = [
    {
      id: 'aditya',
      name: 'ASTRA ADITYA',
      subtitle: 'Solar Threat Intelligence',
      icon: '☀️',
      color: '#e0a554',
      description: 'Monitor solar flares, CMEs, and space weather',
      status: 'ACTIVE',
      threat: 65,
    },
    {
      id: 'bhumi',
      name: 'ASTRA BHUMI',
      subtitle: 'Earth Hazard Monitoring',
      icon: '🌍',
      color: '#4ecdc4',
      description: 'Track floods, heatwaves, wildfires across India',
      status: 'ACTIVE',
      threat: 72,
    },
    {
      id: 'kaksha',
      name: 'ASTRA KAKSHA',
      subtitle: 'Orbital Debris Analysis',
      icon: '🛰️',
      color: '#95e1d3',
      description: 'Visualize satellites and space debris in 3D',
      status: 'ACTIVE',
      threat: 45,
    },
  ];

  const handleModuleClick = (moduleId: string) => {
    navigate(`/${moduleId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="main-dashboard">
      <PlanetBackground />

      <div className="dashboard-overlay">
        {/* Welcome Overlay */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              className="welcome-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="welcome-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="welcome-icon">🛰️</span>
                <h2>Welcome to ASTRA NET</h2>
                <p>Initializing threat monitoring systems...</p>
                <div className="welcome-loader">
                  <motion.div 
                    className="loader-bar"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.5 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Panel */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              className="notification-panel"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="notification-header">
                <h3>🔔 Alerts & Notifications</h3>
                <button onClick={() => setShowNotification(false)}>✕</button>
              </div>
              <div className="notification-list">
                {notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    className={`notification-item ${notif.type}`}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="notif-icon">
                      {notif.type === 'warning' ? '⚠️' : notif.type === 'alert' ? '🚨' : 'ℹ️'}
                    </span>
                    <div className="notif-content">
                      <p>{notif.message}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    <button className="notif-dismiss" onClick={() => dismissNotification(notif.id)}>✕</button>
                  </motion.div>
                ))}
                {notifications.length === 0 && (
                  <p className="no-notifications">No new notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.header
          className="dashboard-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="header-left">
            <h1 className="brand-title">ASTRA NET</h1>
            <p className="brand-subtitle">Advanced Space Threat Response & Analysis Network</p>
          </div>
          <div className="header-right">
            {/* Live Clock */}
            <div className="live-clock">
              <div className="clock-time">{formatTime(currentTime)}</div>
              <div className="clock-date">{formatDate(currentTime)}</div>
            </div>
            
            {/* Data Status */}
            <div className={`data-status ${isDataRefreshing ? 'refreshing' : ''}`}>
              <span className="status-indicator"></span>
              <span>{isDataRefreshing ? 'Syncing...' : 'Live Data'}</span>
            </div>

            {/* Notification Bell */}
            <button className="notification-btn" onClick={() => setShowNotification(!showNotification)}>
              <span className="bell-icon">🔔</span>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>

            {/* NASA Live Data Toggle */}
            <button 
              className={`nasa-toggle-btn ${showNASAPanel ? 'active' : ''}`} 
              onClick={() => setShowNASAPanel(!showNASAPanel)}
              title="NASA Live Data (L)"
            >
              <span className="nasa-icon">🚀</span>
              <span className="nasa-btn-label">NASA</span>
            </button>

            <div className="user-info">
              <span className="user-greeting">Welcome,</span>
              <span className="user-name">{user?.name || 'Operator'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Unified Threat Score */}
          <motion.section
            className="threat-section"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="threat-card">
              <h2 className="threat-title">UNIFIED THREAT SCORE</h2>
              <div className="threat-display">
                <div className="threat-gauge">
                  <svg viewBox="0 0 200 200" className="gauge-svg">
                    {/* Background arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="400"
                      strokeDashoffset="133"
                      transform="rotate(135 100 100)"
                    />
                    {/* Progress arc */}
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke={threatInfo.color}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="400"
                      initial={{ strokeDashoffset: 400 }}
                      animate={{ strokeDashoffset: 400 - (displayScore / 100) * 267 }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                      transform="rotate(135 100 100)"
                      style={{ filter: `drop-shadow(0 0 10px ${threatInfo.color})` }}
                    />
                  </svg>
                  <div className="gauge-center">
                    <span className="score-number">{displayScore}</span>
                    <span className="score-max">/100</span>
                  </div>
                </div>
                <div className="threat-info">
                  <div className="threat-level" style={{ color: threatInfo.color }}>
                    <span className="level-dot" style={{ backgroundColor: threatInfo.color }}></span>
                    {threatInfo.level}
                  </div>
                  <p className="threat-desc">
                    Combined risk assessment from solar activity, earth hazards, and orbital threats
                  </p>
                  <div className="threat-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Solar</span>
                      <div className="breakdown-bar">
                        <motion.div
                          className="breakdown-fill"
                          style={{ backgroundColor: '#e0a554' }}
                          initial={{ width: 0 }}
                          animate={{ width: '65%' }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </div>
                      <span className="breakdown-value">65</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Earth</span>
                      <div className="breakdown-bar">
                        <motion.div
                          className="breakdown-fill"
                          style={{ backgroundColor: '#4ecdc4' }}
                          initial={{ width: 0 }}
                          animate={{ width: '72%' }}
                          transition={{ duration: 1.5, delay: 0.7 }}
                        />
                      </div>
                      <span className="breakdown-value">72</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Space</span>
                      <div className="breakdown-bar">
                        <motion.div
                          className="breakdown-fill"
                          style={{ backgroundColor: '#95e1d3' }}
                          initial={{ width: 0 }}
                          animate={{ width: '45%' }}
                          transition={{ duration: 1.5, delay: 0.9 }}
                        />
                      </div>
                      <span className="breakdown-value">45</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Module Navigation */}
          <section className="modules-section">
            <h2 className="section-title">THREAT MONITORING MODULES</h2>
            <div className="modules-grid">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  className="module-card"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{
                    y: -10,
                    boxShadow: `0 20px 60px ${module.color}40, 0 0 40px ${module.color}30`,
                  }}
                  onClick={() => handleModuleClick(module.id)}
                >
                  <div className="module-glow" style={{ background: `radial-gradient(circle at center, ${module.color}20, transparent)` }} />
                  <div className="module-header">
                    <span className="module-icon">{module.icon}</span>
                    <div className="module-status">
                      <span className="status-dot" style={{ backgroundColor: '#10b981' }}></span>
                      {module.status}
                    </div>
                  </div>
                  <h3 className="module-name">{module.name}</h3>
                  <p className="module-subtitle">{module.subtitle}</p>
                  <p className="module-desc">{module.description}</p>
                  <div className="module-footer">
                    <div className="module-threat">
                      <span className="threat-label">Threat Level</span>
                      <div className="threat-mini-bar">
                        <motion.div
                          className="threat-mini-fill"
                          style={{ backgroundColor: module.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${module.threat}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                      <span className="threat-mini-value">{module.threat}</span>
                    </div>
                    <div className="module-enter">
                      <span className="shortcut-key">{index + 1}</span>
                      Enter Module
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="shortcut-hint">Press <kbd>1</kbd>, <kbd>2</kbd>, or <kbd>3</kbd> to quick-navigate • <kbd>N</kbd> for notifications • <kbd>L</kbd> for NASA data</p>
          </section>

          {/* Quick Stats */}
          <motion.section
            className="stats-section"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#e0a554' }}>☀️</div>
                <div className="stat-content">
                  <span className="stat-value">M2.5</span>
                  <span className="stat-label">Latest Flare</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#4ecdc4' }}>🌡️</div>
                <div className="stat-content">
                  <span className="stat-value">+2.5°C</span>
                  <span className="stat-label">Temp Anomaly</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#95e1d3' }}>🛰️</div>
                <div className="stat-content">
                  <span className="stat-value">3</span>
                  <span className="stat-label">Active Alerts</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#f59e0b' }}>⚠️</div>
                <div className="stat-content">
                  <span className="stat-value">12h</span>
                  <span className="stat-label">Next Event</span>
                </div>
              </div>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>ASTRA NET v1.0 • Real-time Space & Earth Threat Intelligence Platform</p>
          <p>Data Sources: ISRO • IMD • NASA • NOAA • ESA</p>
        </footer>

        {/* NASA Live Data Panel */}
        <AnimatePresence>
          {showNASAPanel && (
            <motion.div
              className="nasa-panel-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNASAPanel(false)}
            >
              <motion.div
                className="nasa-panel-container"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-nasa-panel" onClick={() => setShowNASAPanel(false)}>
                  ✕ Close
                </button>
                <NASADataPanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainDashboard;
