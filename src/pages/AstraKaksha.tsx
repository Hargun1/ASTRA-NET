import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from 'recharts';
import OrbitVisualization from '../components/visualizations/OrbitVisualization';
import { useDataStore } from '../store/dataStore';
import '../styles/AstraKaksha.css';

const AstraKaksha: React.FC = () => {
  const navigate = useNavigate();
  const { spaceData } = useDataStore();
  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conjunctions' | 'decay' | 'debris'>('conjunctions');

  // Calculate average vulnerability score
  const avgVulnerability = Math.round(
    spaceData.satellites
      .filter(s => s.type === 'active' && s.vulnerabilityScore)
      .reduce((acc, s) => acc + (s.vulnerabilityScore || 0), 0) /
    spaceData.satellites.filter(s => s.type === 'active' && s.vulnerabilityScore).length
  ) || 45;

  const vulnerabilityData = [
    { name: 'Vulnerability', value: avgVulnerability, fill: avgVulnerability > 60 ? '#ef4444' : avgVulnerability > 40 ? '#f59e0b' : '#22c55e' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'moderate': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'degraded': return '#f59e0b';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'normal': return '#22c55e';
      case 'degraded':
      case 'elevated': return '#f59e0b';
      case 'severe':
      case 'high':
      case 'disrupted': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return '#dc2626';
    if (risk >= 50) return '#f59e0b';
    if (risk >= 30) return '#eab308';
    return '#22c55e';
  };

  const debrisDensityData = [
    { name: 'LEO', value: spaceData.debrisDensity.leo, color: '#4ecdc4' },
    { name: 'MEO', value: spaceData.debrisDensity.meo, color: '#f59e0b' },
    { name: 'GEO', value: spaceData.debrisDensity.geo, color: '#8b5cf6' },
  ];

  const activeSatellites = spaceData.satellites.filter(s => s.type === 'active');

  return (
    <div className="astra-kaksha">
      {/* Background */}
      <div className="kaksha-bg"></div>

      {/* Header */}
      <motion.header
        className="kaksha-header"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <div className="header-center">
          <h1 className="page-title">
            <span className="icon">🛰️</span>
            ASTRA KAKSHA
          </h1>
          <p className="page-subtitle">Orbital Debris Analysis System</p>
        </div>
        <div className="header-right">
          <div className="tracking-badge">
            <span className="tracking-count">{spaceData.totalTrackedObjects || 4589}</span>
            <span className="tracking-label">Objects Tracked</span>
          </div>
          {spaceData.activeManeuvers > 0 && (
            <motion.div
              className="maneuver-badge"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="maneuver-icon">🚀</span>
              <span className="maneuver-text">{spaceData.activeManeuvers} Active Maneuvers</span>
            </motion.div>
          )}
          <div className="header-status">
            <span className="status-dot active"></span>
            TRACKING ACTIVE
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="kaksha-content">
        <div className="kaksha-grid">
          {/* Left Panel */}
          <div className="left-panel">
            {/* Alert Tabs */}
            <motion.div
              className="panel alerts-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="alert-tabs">
                <button
                  className={`alert-tab ${activeTab === 'conjunctions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('conjunctions')}
                >
                  <span className="tab-icon">⚠️</span>
                  <span className="tab-label">Conjunctions</span>
                  <span className="tab-count">{spaceData.conjunctions.length}</span>
                </button>
                <button
                  className={`alert-tab ${activeTab === 'decay' ? 'active' : ''}`}
                  onClick={() => setActiveTab('decay')}
                >
                  <span className="tab-icon">📉</span>
                  <span className="tab-label">Orbital Decay</span>
                  <span className="tab-count">{spaceData.orbitalDecayAlerts?.length || 0}</span>
                </button>
                <button
                  className={`alert-tab ${activeTab === 'debris' ? 'active' : ''}`}
                  onClick={() => setActiveTab('debris')}
                >
                  <span className="tab-icon">💥</span>
                  <span className="tab-label">Debris Hotspots</span>
                  <span className="tab-count">{spaceData.debrisHotspots?.length || 0}</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* Conjunction Alerts */}
                {activeTab === 'conjunctions' && (
                  <motion.div
                    key="conjunctions"
                    className="alert-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="conjunction-list">
                      {spaceData.conjunctions.map((conj, index) => (
                        <motion.div
                          key={conj.id}
                          className="conjunction-item"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="conj-severity" style={{ backgroundColor: getSeverityColor(conj.severity) }}>
                            {conj.severity.charAt(0).toUpperCase()}
                          </div>
                          <div className="conj-details">
                            <div className="conj-objects">
                              <span className="obj-a">{conj.objectA}</span>
                              <span className="conj-vs">vs</span>
                              <span className="obj-b">{conj.objectB}</span>
                            </div>
                            <div className="conj-meta">
                              <span className="conj-time">⏱ {conj.timeToApproach}</span>
                              <span className="conj-distance">📏 {conj.distance} km</span>
                            </div>
                          </div>
                          <div className={`conj-status ${conj.severity}`}>
                            {conj.severity.toUpperCase()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Orbital Decay Alerts */}
                {activeTab === 'decay' && (
                  <motion.div
                    key="decay"
                    className="alert-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="decay-list">
                      {(spaceData.orbitalDecayAlerts || []).map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          className="decay-item"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="decay-icon">
                            {alert.dragAlert ? '🔥' : '📉'}
                          </div>
                          <div className="decay-info">
                            <span className="decay-object">{alert.object}</span>
                            <span className="decay-orbit">{alert.currentOrbit}</span>
                          </div>
                          <div className="decay-metrics">
                            <div className="decay-rate">
                              <span className="rate-label">Decay Rate</span>
                              <span className="rate-value" style={{ color: getRiskColor(alert.decayRate * 10) }}>
                                {alert.decayRate} km/day
                              </span>
                            </div>
                            <div className="decay-eta">
                              <span className="eta-label">Re-entry ETA</span>
                              <span className="eta-value">{alert.reentryEta}</span>
                            </div>
                          </div>
                          {alert.dragAlert && (
                            <div className="drag-alert">
                              <span className="drag-icon">⚡</span>
                              <span className="drag-text">HIGH DRAG</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Debris Hotspots */}
                {activeTab === 'debris' && (
                  <motion.div
                    key="debris"
                    className="alert-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="hotspot-list">
                      {(spaceData.debrisHotspots || []).map((hotspot, index) => (
                        <motion.div
                          key={hotspot.id}
                          className="hotspot-item"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="hotspot-region">
                            <span className="region-name">{hotspot.region}</span>
                            <span className="region-altitude">{hotspot.altitude}</span>
                          </div>
                          <div className="hotspot-density">
                            <div className="density-bar-container">
                              <motion.div
                                className="density-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${hotspot.density}%` }}
                                style={{ backgroundColor: getRiskColor(hotspot.density) }}
                              />
                            </div>
                            <span className="density-value">{hotspot.density}%</span>
                          </div>
                          <div className="hotspot-count">
                            <span className="count-number">{hotspot.objectCount}</span>
                            <span className="count-label">Objects</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Vulnerability Score Gauge */}
            <motion.div
              className="panel vulnerability-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h2 className="panel-title">🛡️ Fleet Vulnerability Score</h2>
              <div className="vulnerability-gauge">
                <ResponsiveContainer width="100%" height={160}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={vulnerabilityData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      background={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="vulnerability-value">
                  <span className="vuln-number" style={{ color: vulnerabilityData[0].fill }}>
                    {avgVulnerability}
                  </span>
                  <span className="vuln-label">
                    {avgVulnerability > 60 ? 'HIGH RISK' : avgVulnerability > 40 ? 'MODERATE' : 'LOW RISK'}
                  </span>
                </div>
              </div>
              <div className="vulnerability-factors">
                <div className="factor">
                  <span className="factor-label">Solar Radiation</span>
                  <div className="factor-bar">
                    <motion.div className="factor-fill" initial={{ width: 0 }} animate={{ width: '65%' }} style={{ backgroundColor: '#f59e0b' }} />
                  </div>
                </div>
                <div className="factor">
                  <span className="factor-label">Debris Proximity</span>
                  <div className="factor-bar">
                    <motion.div className="factor-fill" initial={{ width: 0 }} animate={{ width: '45%' }} style={{ backgroundColor: '#22c55e' }} />
                  </div>
                </div>
                <div className="factor">
                  <span className="factor-label">Orbital Decay</span>
                  <div className="factor-bar">
                    <motion.div className="factor-fill" initial={{ width: 0 }} animate={{ width: '30%' }} style={{ backgroundColor: '#22c55e' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Satellite Health */}
            <motion.div
              className="panel health-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="panel-title">🛰️ Satellite Health Monitor</h2>
              <div className="satellite-list">
                {activeSatellites.map((sat, index) => (
                  <motion.div
                    key={sat.id}
                    className={`satellite-item ${selectedSatellite === sat.id ? 'selected' : ''}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSelectedSatellite(sat.id === selectedSatellite ? null : sat.id)}
                  >
                    <div className="sat-info">
                      <span className="sat-name">{sat.name}</span>
                      <span className="sat-orbit">{sat.orbit}</span>
                    </div>
                    <div className="sat-metrics">
                      <div className="sat-vuln-score">
                        <span className="vuln-score-value" style={{ color: getRiskColor(sat.vulnerabilityScore || 40) }}>
                          {sat.vulnerabilityScore || 40}
                        </span>
                        <span className="vuln-score-label">VULN</span>
                      </div>
                      <div className="sat-status">
                        <span className="status-dot" style={{ backgroundColor: getStatusColor(sat.status) }}></span>
                        <span style={{ color: getStatusColor(sat.status) }}>{sat.status.toUpperCase()}</span>
                      </div>
                      {sat.dragAlert && (
                        <span className="drag-badge">⚡DRAG</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center - 3D Visualization */}
          <div className="center-area">
            <motion.div
              className="orbit-container"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="orbit-header">
                <h2 className="orbit-title">🌐 Live Orbital Visualization</h2>
                <div className="orbit-legend">
                  <span className="legend-item">
                    <span className="dot leo"></span>LEO
                  </span>
                  <span className="legend-item">
                    <span className="dot meo"></span>MEO
                  </span>
                  <span className="legend-item">
                    <span className="dot geo"></span>GEO
                  </span>
                  <span className="legend-item">
                    <span className="dot debris"></span>Debris
                  </span>
                </div>
              </div>
              <div className="orbit-wrapper">
                <OrbitVisualization satellites={spaceData.satellites} />
              </div>
              <div className="orbit-controls-hint">
                <span>🖱️ Drag to rotate • Scroll to zoom</span>
              </div>
            </motion.div>

            {/* Operator Alert System - NEW */}
            <motion.div
              className="panel operator-panel"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="panel-title">📣 Operator Alert System</h2>
              <div className="operator-alerts">
                {(spaceData.operatorAlerts || []).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className={`operator-alert ${selectedOperator === alert.id ? 'expanded' : ''}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => setSelectedOperator(selectedOperator === alert.id ? null : alert.id)}
                  >
                    <div className="alert-header">
                      <span className="alert-type-badge" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
                        {alert.type.toUpperCase()}
                      </span>
                      <span className="alert-operator">{alert.operator}</span>
                      <span className="alert-timestamp">{alert.timestamp}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <AnimatePresence>
                      {selectedOperator === alert.id && (
                        <motion.div
                          className="alert-actions"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <button className="action-btn acknowledge">
                            <span>✓</span> Acknowledge
                          </button>
                          <button className="action-btn details">
                            <span>📋</span> View Details
                          </button>
                          <button className="action-btn escalate">
                            <span>🚨</span> Escalate
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="right-panel">
            {/* Debris Density Map */}
            <motion.div
              className="panel density-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="panel-title">📊 Debris Density by Orbit</h2>
              <div className="density-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={debrisDensityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 20, 40, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Density']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {debrisDensityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="density-summary">
                <div className="density-stat">
                  <span className="stat-value">{spaceData.totalTrackedObjects || 4589}</span>
                  <span className="stat-label">Total Tracked</span>
                </div>
                <div className="density-stat">
                  <span className="stat-value">{spaceData.satellites.filter(s => s.type === 'debris').length + 55}</span>
                  <span className="stat-label">Debris Objects</span>
                </div>
                <div className="density-stat">
                  <span className="stat-value">{activeSatellites.length}</span>
                  <span className="stat-label">Active Satellites</span>
                </div>
              </div>
            </motion.div>

            {/* Space Weather Impact */}
            <motion.div
              className="panel weather-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="panel-title">☀️ Space Weather Impact</h2>
              <div className="impact-list">
                <div className="impact-item">
                  <div className="impact-header">
                    <span className="impact-icon">📡</span>
                    <span className="impact-name">Navigation</span>
                  </div>
                  <div className="impact-status" style={{ color: getImpactColor(spaceData.spaceWeatherImpact.navigation) }}>
                    {spaceData.spaceWeatherImpact.navigation.toUpperCase()}
                  </div>
                  <div className="impact-bar">
                    <motion.div
                      className="impact-fill"
                      initial={{ width: 0 }}
                      animate={{
                        width: spaceData.spaceWeatherImpact.navigation === 'normal' ? '30%' :
                               spaceData.spaceWeatherImpact.navigation === 'degraded' ? '60%' : '90%'
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                      style={{ backgroundColor: getImpactColor(spaceData.spaceWeatherImpact.navigation) }}
                    />
                  </div>
                </div>
                <div className="impact-item">
                  <div className="impact-header">
                    <span className="impact-icon">💻</span>
                    <span className="impact-name">Electronics</span>
                  </div>
                  <div className="impact-status" style={{ color: getImpactColor(spaceData.spaceWeatherImpact.electronics) }}>
                    {spaceData.spaceWeatherImpact.electronics.toUpperCase()}
                  </div>
                  <div className="impact-bar">
                    <motion.div
                      className="impact-fill"
                      initial={{ width: 0 }}
                      animate={{
                        width: spaceData.spaceWeatherImpact.electronics === 'normal' ? '30%' :
                               spaceData.spaceWeatherImpact.electronics === 'elevated' ? '60%' : '90%'
                      }}
                      transition={{ duration: 1, delay: 0.4 }}
                      style={{ backgroundColor: getImpactColor(spaceData.spaceWeatherImpact.electronics) }}
                    />
                  </div>
                </div>
                <div className="impact-item">
                  <div className="impact-header">
                    <span className="impact-icon">📶</span>
                    <span className="impact-name">Communications</span>
                  </div>
                  <div className="impact-status" style={{ color: getImpactColor(spaceData.spaceWeatherImpact.communications) }}>
                    {spaceData.spaceWeatherImpact.communications.toUpperCase()}
                  </div>
                  <div className="impact-bar">
                    <motion.div
                      className="impact-fill"
                      initial={{ width: 0 }}
                      animate={{
                        width: spaceData.spaceWeatherImpact.communications === 'normal' ? '30%' :
                               spaceData.spaceWeatherImpact.communications === 'disrupted' ? '60%' : '90%'
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                      style={{ backgroundColor: getImpactColor(spaceData.spaceWeatherImpact.communications) }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Orbit Reference + Collision Risk */}
            <motion.div
              className="panel stats-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="panel-title">🎯 Collision Risk Matrix</h2>
              <div className="collision-matrix">
                <div className="matrix-row">
                  <span className="matrix-label">LEO</span>
                  <div className="matrix-cells">
                    <div className="matrix-cell high" title="LEO-LEO: High Risk">H</div>
                    <div className="matrix-cell moderate" title="LEO-MEO: Moderate">M</div>
                    <div className="matrix-cell low" title="LEO-GEO: Low">L</div>
                  </div>
                </div>
                <div className="matrix-row">
                  <span className="matrix-label">MEO</span>
                  <div className="matrix-cells">
                    <div className="matrix-cell moderate" title="MEO-LEO: Moderate">M</div>
                    <div className="matrix-cell moderate" title="MEO-MEO: Moderate">M</div>
                    <div className="matrix-cell low" title="MEO-GEO: Low">L</div>
                  </div>
                </div>
                <div className="matrix-row">
                  <span className="matrix-label">GEO</span>
                  <div className="matrix-cells">
                    <div className="matrix-cell low" title="GEO-LEO: Low">L</div>
                    <div className="matrix-cell low" title="GEO-MEO: Low">L</div>
                    <div className="matrix-cell moderate" title="GEO-GEO: Moderate">M</div>
                  </div>
                </div>
                <div className="matrix-axis">
                  <span>LEO</span>
                  <span>MEO</span>
                  <span>GEO</span>
                </div>
              </div>
              <div className="matrix-legend">
                <span><span className="legend-dot high"></span>High Risk</span>
                <span><span className="legend-dot moderate"></span>Moderate</span>
                <span><span className="legend-dot low"></span>Low Risk</span>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="panel orbit-info-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <h2 className="panel-title">📍 Orbital Zones</h2>
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="stat-icon">🌍</span>
                  <div className="stat-content">
                    <span className="stat-value">LEO: 200-2000 km</span>
                    <span className="stat-label">Low Earth Orbit</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="stat-icon">🔵</span>
                  <div className="stat-content">
                    <span className="stat-value">MEO: 2000-35786 km</span>
                    <span className="stat-label">Medium Earth Orbit</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="stat-icon">🟣</span>
                  <div className="stat-content">
                    <span className="stat-value">GEO: 35786 km</span>
                    <span className="stat-label">Geostationary Orbit</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AstraKaksha;
