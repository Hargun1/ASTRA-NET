import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNASAData } from '../hooks/useNASAData';
import '../styles/NASADataPanel.css';

interface NASADataPanelProps {
  compact?: boolean;
}

const NASADataPanel: React.FC<NASADataPanelProps> = ({ compact = false }) => {
  const { data, loading, error, refetch, lastUpdated } = useNASAData();

  if (loading && !data) {
    return (
      <div className="nasa-panel loading">
        <div className="nasa-loader">
          <div className="loader-ring"></div>
          <span>Connecting to NASA APIs...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="nasa-panel error">
        <span className="error-icon">⚠️</span>
        <span>NASA API Connection Failed</span>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  const formatDistance = (km: number) => {
    if (km >= 1000000) return `${(km / 1000000).toFixed(2)}M km`;
    if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`;
    return `${km} km`;
  };

  return (
    <motion.div
      className={`nasa-panel ${compact ? 'compact' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="nasa-header">
        <div className="nasa-title">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" 
            alt="NASA" 
            className="nasa-logo"
          />
          <span>NASA LIVE DATA</span>
          {data?.isLive && (
            <motion.span
              className="live-badge"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ● LIVE
            </motion.span>
          )}
        </div>
        <div className="nasa-meta">
          {lastUpdated && (
            <span className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="refresh-btn" onClick={refetch} disabled={loading}>
            {loading ? '↻' : '⟳'}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="nasa-content">
        {/* Near Earth Objects Section */}
        <div className="nasa-section neo-section">
          <h3 className="section-title">
            <span className="section-icon">☄️</span>
            Near Earth Objects (7-Day Window)
          </h3>
          <div className="neo-stats">
            <div className="neo-stat">
              <span className="stat-number">{data?.neo.totalCount || 0}</span>
              <span className="stat-label">Total Tracked</span>
            </div>
            <div className="neo-stat hazardous">
              <span className="stat-number">{data?.neo.hazardousCount || 0}</span>
              <span className="stat-label">Potentially Hazardous</span>
            </div>
          </div>
          
          <div className="asteroid-list">
            <AnimatePresence>
              {data?.neo.asteroids.slice(0, compact ? 3 : 5).map((asteroid, index) => (
                <motion.div
                  key={asteroid.id}
                  className={`asteroid-item ${asteroid.isHazardous ? 'hazardous' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="asteroid-info">
                    <span className="asteroid-name">
                      {asteroid.isHazardous && <span className="hazard-icon">⚠️</span>}
                      {asteroid.name}
                    </span>
                    <span className="asteroid-date">Approach: {asteroid.approachDate}</span>
                  </div>
                  <div className="asteroid-metrics">
                    <div className="metric">
                      <span className="metric-value">{asteroid.diameter}m</span>
                      <span className="metric-label">Diameter</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{formatDistance(asteroid.distance)}</span>
                      <span className="metric-label">Distance</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{asteroid.distanceLunar} LD</span>
                      <span className="metric-label">Lunar Dist.</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{(asteroid.velocity / 1000).toFixed(1)}k</span>
                      <span className="metric-label">km/h</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Solar Activity Section */}
        <div className="nasa-section solar-section">
          <h3 className="section-title">
            <span className="section-icon">☀️</span>
            Solar Activity (DONKI)
          </h3>
          
          {/* CME Data */}
          {data?.cme && (
            <div className="cme-card">
              <div className="cme-header">
                <span className="cme-title">Latest CME</span>
                {data.cme.earthDirected && (
                  <span className="earth-directed">🌍 Earth-Directed</span>
                )}
              </div>
              <div className="cme-details">
                <div className="cme-metric">
                  <span className="cme-value">{data.cme.speed || 'N/A'}</span>
                  <span className="cme-label">km/s Speed</span>
                </div>
                <div className="cme-metric">
                  <span className="cme-value">{data.cme.totalCMEs}</span>
                  <span className="cme-label">CMEs (30d)</span>
                </div>
                <div className="cme-metric">
                  <span className="cme-value">{data.cme.activeRegion || 'N/A'}</span>
                  <span className="cme-label">Active Region</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Flares */}
          <div className="flare-list">
            <h4>Recent Solar Flares</h4>
            {data?.flares.slice(0, compact ? 3 : 5).map((flare, index) => (
              <motion.div
                key={flare.id}
                className={`flare-item ${flare.severity}`}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className={`flare-class ${flare.class.toLowerCase()}`}>
                  {flare.fullClass}
                </span>
                <span className="flare-region">{flare.region}</span>
                <span className="flare-time">{flare.time}</span>
              </motion.div>
            ))}
            {(!data?.flares || data.flares.length === 0) && (
              <div className="no-data">No recent flares detected</div>
            )}
          </div>

          {/* Geomagnetic Storm */}
          {data?.gst && (
            <div className="gst-card">
              <div className="gst-header">
                <span className="gst-icon">⚡</span>
                <span className="gst-title">Geomagnetic Storm Active</span>
              </div>
              <div className="gst-kp">
                <span className="kp-value">Kp {data.gst.kpIndex}</span>
                <span className="kp-scale">
                  {data.gst.kpIndex >= 7 ? 'Severe' : data.gst.kpIndex >= 5 ? 'Moderate' : 'Minor'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* APOD Section */}
        {data?.apod && !compact && (
          <div className="nasa-section apod-section">
            <h3 className="section-title">
              <span className="section-icon">🔭</span>
              Astronomy Picture of the Day
            </h3>
            <div className="apod-card">
              {data.apod.media_type === 'image' ? (
                <img 
                  src={data.apod.url} 
                  alt={data.apod.title}
                  className="apod-image"
                />
              ) : (
                <div className="apod-video">
                  <span>🎬 Video: {data.apod.title}</span>
                </div>
              )}
              <div className="apod-info">
                <h4 className="apod-title">{data.apod.title}</h4>
                <p className="apod-desc">{data.apod.explanation.substring(0, 150)}...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="nasa-footer">
        <span>Data: NASA DONKI, NEO, APOD APIs</span>
        <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer">
          api.nasa.gov
        </a>
      </div>
    </motion.div>
  );
};

export default NASADataPanel;
