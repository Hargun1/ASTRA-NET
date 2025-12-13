import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useDataStore } from '../store/dataStore';
import 'leaflet/dist/leaflet.css';
import '../styles/AstraBhumi.css';

// Custom map component to set bounds to India
const IndiaMap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([22.5, 82], 5);
  }, [map]);

  return <>{children}</>;
};

const AstraBhumi: React.FC = () => {
  const navigate = useNavigate();
  const { hazardData } = useDataStore();
  const [activeLayer, setActiveLayer] = useState<'flood' | 'heatwave' | 'wildfire' | 'rainfall'>('flood');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showHistoricalStorm, setShowHistoricalStorm] = useState<string | null>(null);
  const [earthPulse, setEarthPulse] = useState(1);

  // Simulate Earth reacting to solar activity
  useEffect(() => {
    if (hazardData.geomagneticStorm.active) {
      const interval = setInterval(() => {
        setEarthPulse(prev => prev === 1 ? 1.02 : 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [hazardData.geomagneticStorm.active]);

  const layers = [
    { id: 'flood', name: 'Flood', color: '#3b82f6', icon: '🌊' },
    { id: 'heatwave', name: 'Heatwave', color: '#ef4444', icon: '🌡️' },
    { id: 'wildfire', name: 'Wildfire', color: '#f59e0b', icon: '🔥' },
    { id: 'rainfall', name: 'Rainfall', color: '#22c55e', icon: '🌧️' },
  ];

  const getLayerData = () => {
    switch (activeLayer) {
      case 'flood': return hazardData.floods;
      case 'heatwave': return hazardData.heatwaves;
      case 'wildfire': return hazardData.wildfires;
      case 'rainfall': return hazardData.rainfall.map(r => ({ ...r, level: Math.abs(r.anomaly) }));
      default: return [];
    }
  };

  const getMarkerColor = (level: number) => {
    if (level >= 80) return '#dc2626';
    if (level >= 60) return '#f59e0b';
    if (level >= 40) return '#eab308';
    return '#22c55e';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      extreme: '#dc2626',
      high: '#f59e0b',
      moderate: '#eab308',
      low: '#22c55e',
    };
    return colors[severity] || '#6b7280';
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { status: 'Good', color: '#22c55e' };
    if (aqi <= 100) return { status: 'Moderate', color: '#eab308' };
    if (aqi <= 150) return { status: 'Unhealthy (Sensitive)', color: '#f59e0b' };
    if (aqi <= 200) return { status: 'Unhealthy', color: '#ef4444' };
    return { status: 'Hazardous', color: '#dc2626' };
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return '#dc2626';
    if (risk >= 50) return '#f59e0b';
    if (risk >= 30) return '#eab308';
    return '#22c55e';
  };

  const aqiInfo = getAQIStatus(hazardData.liveMetrics.aqi);

  return (
    <div className="astra-bhumi">
      <div className="bhumi-bg"></div>

      {/* Header */}
      <motion.header
        className="bhumi-header"
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
            <span className="icon">🌍</span>
            ASTRA BHUMI
          </h1>
          <p className="page-subtitle">Earth Hazard & Impact Monitoring</p>
        </div>
        <div className="header-right">
          {hazardData.geomagneticStorm.active && (
            <motion.div
              className="storm-badge"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="storm-icon">⚡</span>
              <span className="storm-text">GEOMAGNETIC STORM ACTIVE</span>
            </motion.div>
          )}
          <div className="header-status">
            <span className="status-dot active"></span>
            REAL-TIME DATA
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="bhumi-content">
        <div className="bhumi-grid">
          {/* Left Sidebar */}
          <div className="left-sidebar">
            {/* Layer Controls */}
            <motion.div
              className="panel layer-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="panel-title">🗺️ Hazard Layers</h2>
              <div className="layer-buttons">
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    className={`layer-btn ${activeLayer === layer.id ? 'active' : ''}`}
                    onClick={() => setActiveLayer(layer.id as typeof activeLayer)}
                    style={{
                      '--layer-color': layer.color,
                      borderColor: activeLayer === layer.id ? layer.color : 'transparent',
                    } as React.CSSProperties}
                  >
                    <span className="layer-icon">{layer.icon}</span>
                    <span className="layer-name">{layer.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Live Metrics */}
            <motion.div
              className="panel metrics-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="panel-title">📊 Live Environmental Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">🌡️</div>
                  <div className="metric-info">
                    <span className="metric-label">Temp Anomaly</span>
                    <span className="metric-value" style={{ color: hazardData.liveMetrics.tempAnomaly > 0 ? '#ef4444' : '#3b82f6' }}>
                      {hazardData.liveMetrics.tempAnomaly > 0 ? '+' : ''}{hazardData.liveMetrics.tempAnomaly}°C
                    </span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">💧</div>
                  <div className="metric-info">
                    <span className="metric-label">Humidity</span>
                    <span className="metric-value">{hazardData.liveMetrics.humidity}%</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🌫️</div>
                  <div className="metric-info">
                    <span className="metric-label">AQI</span>
                    <span className="metric-value" style={{ color: aqiInfo.color }}>
                      {hazardData.liveMetrics.aqi}
                    </span>
                    <span className="metric-status" style={{ color: aqiInfo.color }}>
                      {aqiInfo.status}
                    </span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🌧️</div>
                  <div className="metric-info">
                    <span className="metric-label">Precip. Probability</span>
                    <span className="metric-value">{hazardData.liveMetrics.precipProbability}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sector Impact Cards - NEW */}
            <motion.div
              className="panel sector-panel"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <h2 className="panel-title">🏭 Sector Impact Analysis</h2>
              <div className="sector-cards">
                {Object.entries(hazardData.sectorImpact).map(([sector, data], index) => (
                  <motion.div
                    key={sector}
                    className="sector-card"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="sector-header">
                      <span className="sector-icon">
                        {sector === 'aviation' ? '✈️' : sector === 'telecom' ? '📡' : sector === 'power' ? '⚡' : '🛡️'}
                      </span>
                      <span className="sector-name">{sector.charAt(0).toUpperCase() + sector.slice(1)}</span>
                      <span className="sector-status" style={{ color: getRiskColor(data.risk) }}>
                        {data.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="sector-details">{data.details}</p>
                    <div className="sector-risk-bar">
                      <motion.div
                        className="risk-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.risk}%` }}
                        transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                        style={{ backgroundColor: getRiskColor(data.risk) }}
                      />
                    </div>
                    <span className="risk-value">{data.risk}%</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center - Map & Earth Visualization */}
          <div className="center-area">
            {/* 3D Earth Response Indicator */}
            <motion.div
              className="panel earth-response-panel"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="earth-response">
                <motion.div
                  className="earth-visual"
                  animate={{ scale: earthPulse }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="earth-emoji">🌍</span>
                  {hazardData.geomagneticStorm.active && (
                    <motion.div
                      className="storm-effect"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </motion.div>
                <div className="response-info">
                  <h3>Earth Geomagnetic Status</h3>
                  <div className="kp-display">
                    <span className="kp-label">Kp Index</span>
                    <span className="kp-value" style={{ color: hazardData.geomagneticStorm.kpIndex >= 5 ? '#f59e0b' : '#22c55e' }}>
                      {hazardData.geomagneticStorm.kpIndex}
                    </span>
                  </div>
                  <p className="storm-duration">
                    Expected Duration: {hazardData.geomagneticStorm.expectedDuration}
                  </p>
                </div>
                <div className="impact-zones-mini">
                  {hazardData.geomagneticStorm.impactZones.map((zone, i) => (
                    <div key={i} className="zone-mini">
                      <span className="zone-name">{zone.region}</span>
                      <div className="zone-bar-mini">
                        <motion.div
                          className="zone-fill-mini"
                          initial={{ width: 0 }}
                          animate={{ width: `${zone.risk}%` }}
                          style={{ backgroundColor: getRiskColor(zone.risk) }}
                        />
                      </div>
                      <span className="zone-risk">{zone.risk}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* India Map */}
            <motion.div
              className="map-container"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="map-header">
                <h2 className="map-title">🇮🇳 India Hazard Map</h2>
                <div className="map-legend">
                  <span className="legend-item"><span className="dot low"></span>Low</span>
                  <span className="legend-item"><span className="dot moderate"></span>Moderate</span>
                  <span className="legend-item"><span className="dot high"></span>High</span>
                  <span className="legend-item"><span className="dot critical"></span>Critical</span>
                </div>
              </div>
              <div className="map-wrapper">
                <MapContainer
                  center={[22.5, 82]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <IndiaMap>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {getLayerData().map((point, index) => (
                      <CircleMarker
                        key={index}
                        center={[point.lat, point.lng]}
                        radius={Math.max(10, point.level / 4)}
                        pathOptions={{
                          color: getMarkerColor(point.level),
                          fillColor: getMarkerColor(point.level),
                          fillOpacity: 0.6,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="map-popup">
                            <strong>{point.state}</strong>
                            <span>Risk Level: {point.level}%</span>
                            <span>Type: {activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </IndiaMap>
                </MapContainer>
              </div>
              <div className="active-layer-indicator">
                <span className="indicator-icon">{layers.find(l => l.id === activeLayer)?.icon}</span>
                <span className="indicator-text">Showing {activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)} Data</span>
              </div>
            </motion.div>

            {/* Historical Storm Replay - NEW */}
            <motion.div
              className="panel history-panel"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="panel-title">📜 Historical Storm Replay</h2>
              <div className="storm-history">
                {hazardData.historicalStorms.map((storm, index) => (
                  <motion.div
                    key={storm.id}
                    className={`storm-card ${showHistoricalStorm === storm.id ? 'expanded' : ''}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => setShowHistoricalStorm(showHistoricalStorm === storm.id ? null : storm.id)}
                  >
                    <div className="storm-header">
                      <span className="storm-name">{storm.name}</span>
                      <span className="storm-date">{storm.date}</span>
                    </div>
                    <div className="storm-kp">
                      <span className="kp-badge" style={{ backgroundColor: storm.kpIndex >= 8 ? '#dc2626' : '#f59e0b' }}>
                        Kp {storm.kpIndex}
                      </span>
                    </div>
                    <AnimatePresence>
                      {showHistoricalStorm === storm.id && (
                        <motion.p
                          className="storm-desc"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          {storm.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            {/* Disaster Feed */}
            <motion.div
              className="panel feed-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="panel-title">🚨 Live Disaster Feed</h2>
              <div className="alert-list">
                {hazardData.alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className={`alert-item ${selectedAlert === alert.id ? 'selected' : ''}`}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => setSelectedAlert(alert.id === selectedAlert ? null : alert.id)}
                  >
                    <div className="alert-badge" style={{ backgroundColor: getSeverityBadge(alert.severity) }}>
                      {alert.severity.charAt(0).toUpperCase()}
                    </div>
                    <div className="alert-content">
                      <span className="alert-title">{alert.title}</span>
                      <div className="alert-meta">
                        <span className="alert-source">{alert.source}</span>
                        <span className="alert-time">{alert.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Regional Risk Index */}
            <motion.div
              className="panel risk-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="panel-title">📍 Top States at Risk</h2>
              <div className="risk-list">
                {hazardData.topStates.map((state, index) => (
                  <motion.div
                    key={state.name}
                    className="risk-item"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="risk-rank">#{index + 1}</div>
                    <div className="risk-info">
                      <span className="risk-name">{state.name}</span>
                      <span className="risk-type">{state.type}</span>
                    </div>
                    <div className="risk-bar-container">
                      <motion.div
                        className="risk-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${state.risk}%` }}
                        transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                        style={{ backgroundColor: getMarkerColor(state.risk) }}
                      />
                    </div>
                    <span className="risk-value">{state.risk}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 7-Day Hazard Timeline */}
            <motion.div
              className="panel timeline-panel"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="panel-title">📈 7-Day Hazard Trend</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={hazardData.weeklyHazards}>
                    <defs>
                      <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 20, 40, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="flood" stroke="#3b82f6" fill="url(#floodGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="heat" stroke="#ef4444" fill="url(#heatGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="fire" stroke="#f59e0b" fill="url(#fireGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <span><span className="dot flood"></span>Flood</span>
                  <span><span className="dot heat"></span>Heatwave</span>
                  <span><span className="dot fire"></span>Wildfire</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AstraBhumi;
