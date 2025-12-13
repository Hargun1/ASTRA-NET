import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import SunVisualization from '../components/visualizations/SunVisualization';
import { useDataStore } from '../store/dataStore';
import { useNASAData } from '../hooks/useNASAData';
import '../styles/AstraAditya.css';

const AstraAditya: React.FC = () => {
  const navigate = useNavigate();
  const { solarData, updateSolarData } = useDataStore();
  const { data: nasaData, loading: nasaLoading } = useNASAData();
  const [activityIndex, setActivityIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [cmeAnimationPhase, setCmeAnimationPhase] = useState(0);

  // Memoize the NASA data update function
  const updateWithNASAData = useCallback(() => {
    if (nasaData && nasaData.isLive) {
      // Update solar data with NASA flares
      if (nasaData.flares && nasaData.flares.length > 0) {
        updateSolarData({
          flares: nasaData.flares.slice(0, 5).map((flare, idx) => ({
            id: flare.id || String(idx),
            class: flare.class as 'C' | 'M' | 'X',
            time: flare.time,
            severity: flare.severity,
            region: flare.region,
          })),
          dataSource: 'NASA DONKI API (Live)',
          lastUpdate: 'Just now',
        });
      }

      // Update CME data
      if (nasaData.cme) {
        updateSolarData({
          cme: {
            earthDirected: nasaData.cme.earthDirected,
            speed: nasaData.cme.speed || 500,
            angle: nasaData.cme.angle || 15,
            timeToImpact: '48 hours',
            severity: nasaData.cme.earthDirected ? 'high' : 'moderate',
          },
        });
      }
    }
  }, [nasaData, updateSolarData]);

  // Update store with NASA data when available
  useEffect(() => {
    updateWithNASAData();
  }, [updateWithNASAData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivityIndex(solarData.activityIndex);
    }, 500);
    return () => clearTimeout(timer);
  }, [solarData.activityIndex]);

  // CME animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCmeAnimationPhase(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getFlareColor = (flareClass: string) => {
    switch (flareClass) {
      case 'X': return '#dc2626';
      case 'M': return '#f59e0b';
      case 'C': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'moderate': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (status: string) => {
    switch (status) {
      case 'severe':
      case 'emergency':
      case 'high': return '#dc2626';
      case 'degraded':
      case 'watch':
      case 'elevated': return '#f59e0b';
      case 'warning': return '#eab308';
      default: return '#22c55e';
    }
  };

  const getAlertLevelInfo = (level: string) => {
    switch (level) {
      case 'severe': return { color: '#dc2626', icon: '🔴', text: 'SEVERE ALERT' };
      case 'watch': return { color: '#f59e0b', icon: '🟡', text: 'WATCH STATUS' };
      default: return { color: '#22c55e', icon: '🟢', text: 'NORMAL' };
    }
  };

  const alertInfo = getAlertLevelInfo(solarData.alertLevel);

  return (
    <div className="astra-aditya">
      <div className="aditya-bg"></div>

      {/* Header */}
      <motion.header
        className="aditya-header"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <button className="back-btn" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <div className="header-center">
          <h1 className="page-title">
            <span className="icon">☀️</span>
            ASTRA ADITYA
          </h1>
          <p className="page-subtitle">Solar Threat Intelligence System</p>
        </div>
        <div className="header-right">
          <motion.div
            className="alert-level-badge"
            animate={{ scale: solarData.alertLevel !== 'normal' ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ backgroundColor: `${alertInfo.color}20`, borderColor: alertInfo.color }}
          >
            <span className="alert-icon">{alertInfo.icon}</span>
            <span className="alert-text" style={{ color: alertInfo.color }}>{alertInfo.text}</span>
          </motion.div>
          <div className="header-status">
            <span className="status-dot active"></span>
            LIVE MONITORING
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="aditya-content">
        <div className="aditya-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Solar Activity Index - Enhanced */}
            <motion.div
              className="panel solar-activity-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="panel-header">
                <h2 className="panel-title">☀️ Solar Activity Index (SAI)</h2>
                <div className="data-source">
                  <span className="source-icon">🛰️</span>
                  <span>{solarData.dataSource}</span>
                  {nasaData?.isLive && (
                    <motion.span
                      className="nasa-live-badge"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      NASA LIVE
                    </motion.span>
                  )}
                  {nasaLoading && (
                    <span className="nasa-loading">Syncing...</span>
                  )}
                </div>
              </div>
              <div className="activity-gauge">
                <div className="gauge-container">
                  <svg viewBox="0 0 200 120" className="gauge-svg">
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <motion.path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray="251"
                      initial={{ strokeDashoffset: 251 }}
                      animate={{ strokeDashoffset: 251 - (activityIndex / 100) * 251 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="gauge-value">
                    <motion.span
                      className="value-number"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {activityIndex}
                    </motion.span>
                    <span className="value-label">SAI Score</span>
                  </div>
                </div>
                <div className="gauge-labels">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                </div>
              </div>
              <div className="sai-metrics">
                <div className="sai-metric">
                  <span className="metric-label">Kp Index</span>
                  <span className="metric-value" style={{ color: solarData.kpIndex >= 5 ? '#f59e0b' : '#22c55e' }}>{solarData.kpIndex}</span>
                </div>
                <div className="sai-metric">
                  <span className="metric-label">X-Ray Flux</span>
                  <span className="metric-value">{solarData.xrayFlux}</span>
                </div>
                <div className="sai-metric">
                  <span className="metric-label">Proton Flux</span>
                  <span className="metric-value">{solarData.protonFlux} pfu</span>
                </div>
              </div>
            </motion.div>

            {/* Threat Prediction Window */}
            <motion.div
              className="panel prediction-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h2 className="panel-title">🔮 Threat Prediction Window</h2>
              <div className="prediction-content">
                <div className="prediction-main">
                  <div className="prediction-time">
                    <span className="time-icon">⏱️</span>
                    <div className="time-info">
                      <span className="time-label">Next Flare Expected</span>
                      <span className="time-value">{solarData.predictionWindow.nextFlare}</span>
                    </div>
                  </div>
                  <div className="prediction-confidence">
                    <span className="conf-label">Confidence</span>
                    <div className="conf-bar">
                      <motion.div
                        className="conf-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${solarData.predictionWindow.confidence}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="conf-value">{solarData.predictionWindow.confidence}%</span>
                  </div>
                </div>
                <div className="prediction-class">
                  <span className="class-label">Expected Class</span>
                  <span className="class-value">{solarData.predictionWindow.expectedClass}</span>
                </div>
              </div>
            </motion.div>

            {/* Solar Wind Panel */}
            <motion.div
              className="panel solar-wind-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="panel-title">💨 Solar Wind Conditions</h2>
              <div className="wind-metrics">
                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Speed</span>
                    <span className="metric-trend" style={{ color: solarData.solarWind.trend === 'rising' ? '#f59e0b' : '#22c55e' }}>
                      {solarData.solarWind.trend === 'rising' ? '↑ Rising' : solarData.solarWind.trend === 'falling' ? '↓ Falling' : '→ Stable'}
                    </span>
                  </div>
                  <span className="metric-value">{solarData.solarWind.speed}</span>
                  <span className="metric-unit">km/s</span>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill speed"
                      initial={{ width: 0 }}
                      animate={{ width: `${(solarData.solarWind.speed / 800) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Density</span>
                  </div>
                  <span className="metric-value">{solarData.solarWind.density}</span>
                  <span className="metric-unit">p/cm³</span>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill density"
                      initial={{ width: 0 }}
                      animate={{ width: `${(solarData.solarWind.density / 20) * 100}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Magnetic B-field</span>
                  </div>
                  <span className="metric-value">{solarData.solarWind.magneticField}</span>
                  <span className="metric-unit">nT</span>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill bfield"
                      initial={{ width: 0 }}
                      animate={{ width: `${(solarData.solarWind.magneticField / 20) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Solar Flare Log */}
            <motion.div
              className="panel flare-log-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="panel-title">⚡ Recent Solar Flares</h2>
              <div className="flare-list">
                {solarData.flares.map((flare, index) => (
                  <motion.div
                    key={flare.id}
                    className="flare-item"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flare-class" style={{ backgroundColor: getFlareColor(flare.class) }}>
                      {flare.class}
                    </div>
                    <div className="flare-info">
                      <span className="flare-time">{flare.time}</span>
                      <span className="flare-region">{flare.region}</span>
                    </div>
                    <span className="flare-severity" style={{ color: getSeverityColor(flare.severity) }}>
                      {flare.severity.toUpperCase()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center Column */}
          <div className="center-column">
            {/* Solar Heatmap */}
            <motion.div
              className="panel heatmap-panel"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h2 className="panel-title">🗺️ Solar Active Regions Heatmap</h2>
              <div className="solar-heatmap">
                <div className="sun-surface">
                  <SunVisualization intensity={activityIndex / 100} />
                  {solarData.activeRegions.map((region, index) => (
                    <motion.div
                      key={region.id}
                      className={`active-region ${region.risk} ${selectedRegion === region.id ? 'selected' : ''}`}
                      style={{
                        left: `${50 + region.position.x}%`,
                        top: `${50 + region.position.y}%`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: index * 0.1, repeat: Infinity, duration: 2 }}
                      onClick={() => setSelectedRegion(region.id === selectedRegion ? null : region.id)}
                    >
                      <span className="region-marker"></span>
                      <span className="region-label">{region.id}</span>
                    </motion.div>
                  ))}
                </div>
                <AnimatePresence>
                  {selectedRegion && (
                    <motion.div
                      className="region-info-panel"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      {(() => {
                        const region = solarData.activeRegions.find(r => r.id === selectedRegion);
                        return region ? (
                          <>
                            <h3>{region.name}</h3>
                            <div className="region-stats">
                              <span>Activity: {region.activity}%</span>
                              <span style={{ color: getSeverityColor(region.risk) }}>Risk: {region.risk.toUpperCase()}</span>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="heatmap-legend">
                <span className="legend-item"><span className="dot low"></span>Low Risk</span>
                <span className="legend-item"><span className="dot moderate"></span>Moderate</span>
                <span className="legend-item"><span className="dot high"></span>High Risk</span>
                <span className="legend-item"><span className="dot extreme"></span>Extreme</span>
              </div>
            </motion.div>

            {/* CME Tracker */}
            <motion.div
              className="panel cme-tracker-panel"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <h2 className="panel-title">🌊 CME & Solar Flare Tracker</h2>
              <div className="cme-visualization">
                <div className="cme-path">
                  <div className="sun-marker">☀️</div>
                  <div className="path-line">
                    {solarData.cme.earthDirected && (
                      <motion.div
                        className="cme-particle"
                        animate={{ left: `${cmeAnimationPhase}%` }}
                        transition={{ duration: 0 }}
                      />
                    )}
                  </div>
                  <div className="earth-marker">🌍</div>
                </div>
                <div className="cme-info-grid">
                  <div className="cme-stat">
                    <span className="stat-label">Direction</span>
                    <span className={`stat-value ${solarData.cme.earthDirected ? 'alert' : 'safe'}`}>
                      {solarData.cme.earthDirected ? '⚠️ EARTH-DIRECTED' : '✓ NOT EARTH-DIRECTED'}
                    </span>
                  </div>
                  <div className="cme-stat">
                    <span className="stat-label">CME Speed</span>
                    <span className="stat-value">{solarData.cme.speed} km/s</span>
                  </div>
                  <div className="cme-stat">
                    <span className="stat-label">Angle</span>
                    <span className="stat-value">{solarData.cme.angle}°</span>
                  </div>
                  <div className="cme-stat highlight">
                    <span className="stat-label">⏱️ Earth Impact</span>
                    <span className="stat-value">{solarData.cme.timeToImpact}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 7-Day Solar Activity Chart */}
            <motion.div
              className="panel chart-panel"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="panel-title">📊 7-Day Solar Activity Trend</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={solarData.weeklyActivity}>
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 20, 40, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#activityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Alert Levels */}
            <motion.div
              className="panel alert-levels-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="panel-title">🚨 Alert Status</h2>
              <div className="alert-levels">
                <div className={`alert-level-item ${solarData.alertLevel === 'normal' ? 'active' : ''}`}>
                  <span className="level-icon">🟢</span>
                  <span className="level-name">Normal</span>
                  <span className="level-desc">Routine monitoring</span>
                </div>
                <div className={`alert-level-item ${solarData.alertLevel === 'watch' ? 'active' : ''}`}>
                  <span className="level-icon">🟡</span>
                  <span className="level-name">Watch</span>
                  <span className="level-desc">Elevated activity</span>
                </div>
                <div className={`alert-level-item ${solarData.alertLevel === 'severe' ? 'active' : ''}`}>
                  <span className="level-icon">🔴</span>
                  <span className="level-name">Severe</span>
                  <span className="level-desc">Immediate action</span>
                </div>
              </div>
            </motion.div>

            {/* Impact Assessment */}
            <motion.div
              className="panel impact-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="panel-title">🎯 Impact Assessment</h2>
              <div className="impact-zones">
                <div className="impact-zone">
                  <div className="zone-header">
                    <span className="zone-icon">📡</span>
                    <span className="zone-name">GPS Systems</span>
                  </div>
                  <div className="zone-status" style={{ color: getImpactColor(solarData.impactZones.gps) }}>
                    {solarData.impactZones.gps.toUpperCase()}
                  </div>
                  <div className="zone-bar">
                    <motion.div
                      className="zone-fill"
                      initial={{ width: 0 }}
                      animate={{ width: solarData.impactZones.gps === 'normal' ? '30%' : solarData.impactZones.gps === 'degraded' ? '60%' : '90%' }}
                      style={{ backgroundColor: getImpactColor(solarData.impactZones.gps) }}
                    />
                  </div>
                </div>
                <div className="impact-zone">
                  <div className="zone-header">
                    <span className="zone-icon">✈️</span>
                    <span className="zone-name">Aviation Radiation</span>
                  </div>
                  <div className="zone-status" style={{ color: getImpactColor(solarData.impactZones.aviation) }}>
                    {solarData.impactZones.aviation.toUpperCase()}
                  </div>
                  <div className="zone-bar">
                    <motion.div
                      className="zone-fill"
                      initial={{ width: 0 }}
                      animate={{ width: solarData.impactZones.aviation === 'normal' ? '30%' : solarData.impactZones.aviation === 'elevated' ? '60%' : '90%' }}
                      style={{ backgroundColor: getImpactColor(solarData.impactZones.aviation) }}
                    />
                  </div>
                </div>
                <div className="impact-zone">
                  <div className="zone-header">
                    <span className="zone-icon">⚡</span>
                    <span className="zone-name">Power Grids</span>
                  </div>
                  <div className="zone-status" style={{ color: getImpactColor(solarData.impactZones.powerGrids) }}>
                    {solarData.impactZones.powerGrids.toUpperCase()}
                  </div>
                  <div className="zone-bar">
                    <motion.div
                      className="zone-fill"
                      initial={{ width: 0 }}
                      animate={{ width: solarData.impactZones.powerGrids === 'normal' ? '25%' : solarData.impactZones.powerGrids === 'watch' ? '50%' : solarData.impactZones.powerGrids === 'warning' ? '75%' : '95%' }}
                      style={{ backgroundColor: getImpactColor(solarData.impactZones.powerGrids) }}
                    />
                  </div>
                </div>
                <div className="impact-zone">
                  <div className="zone-header">
                    <span className="zone-icon">📻</span>
                    <span className="zone-name">HF Radio</span>
                  </div>
                  <div className="zone-status" style={{ color: '#f59e0b' }}>DEGRADED</div>
                  <div className="zone-bar">
                    <motion.div className="zone-fill" initial={{ width: 0 }} animate={{ width: '55%' }} style={{ backgroundColor: '#f59e0b' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Info Cards */}
            <motion.div
              className="panel info-cards-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="info-cards">
                <div className="info-card">
                  <span className="info-icon">🌡️</span>
                  <div className="info-content">
                    <span className="info-label">Solar Cycle</span>
                    <span className="info-value">25</span>
                  </div>
                </div>
                <div className="info-card">
                  <span className="info-icon">📊</span>
                  <div className="info-content">
                    <span className="info-label">Sunspot Count</span>
                    <span className="info-value">127</span>
                  </div>
                </div>
                <div className="info-card">
                  <span className="info-icon">🔄</span>
                  <div className="info-content">
                    <span className="info-label">Last Update</span>
                    <span className="info-value">{solarData.lastUpdate}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Source Attribution */}
            <motion.div
              className="panel source-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="source-content">
                <span className="source-label">Data Source</span>
                <div className="source-main">
                  <span className="source-icon">🛰️</span>
                  <span className="source-name">{solarData.dataSource}</span>
                </div>
                <p className="source-desc">Real-time solar monitoring data inspired by ISRO's Aditya-L1 mission at the Sun-Earth L1 Lagrange point.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AstraAditya;
