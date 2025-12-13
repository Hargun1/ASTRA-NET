import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/ThreatScore.css';

interface ThreatScoreProps {
  score: number;
}

const ThreatScore: React.FC<ThreatScoreProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    setDisplayScore(Math.round(score));
  }, [score]);

  const getThreatLevel = (s: number): string => {
    if (s < 20) return 'LOW';
    if (s < 40) return 'GUARDED';
    if (s < 60) return 'ELEVATED';
    if (s < 80) return 'HIGH';
    return 'CRITICAL';
  };

  const getThreatColor = (s: number): string => {
    if (s < 20) return '#4ade80';
    if (s < 40) return '#fbbf24';
    if (s < 60) return '#f97316';
    if (s < 80) return '#ef4444';
    return '#dc2626';
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      className="threat-score-container"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <div className="threat-score-card">
        <h2 className="threat-title">Unified Threat Score</h2>

        <div className="score-display">
          <div className="circular-progress">
            <svg viewBox="0 0 200 200" className="progress-svg">
              {/* Background circle */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="#ffffff10" strokeWidth="8" />

              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={getThreatColor(score)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                transform="rotate(-90 100 100)"
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            </svg>

            <motion.div className="score-value">
              <motion.span
                className="score-number"
                key={displayScore}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {displayScore}
              </motion.span>
              <span className="score-unit">/100</span>
            </motion.div>
          </div>

          <div className="threat-details">
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <motion.span
                className="detail-value"
                style={{
                  color: getThreatColor(score),
                  textShadow: `0 0 10px ${getThreatColor(score)}`,
                }}
              >
                {getThreatLevel(score)}
              </motion.span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Threat Vector:</span>
              <span className="detail-value">Multi-Domain</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Last Update:</span>
              <span className="detail-value">REAL-TIME</span>
            </div>

            <div className="threat-indicators">
              <div className="indicator">
                <div className="indicator-dot" style={{ backgroundColor: '#e0a554' }} />
                <span>Solar Activity</span>
              </div>
              <div className="indicator">
                <div className="indicator-dot" style={{ backgroundColor: '#4ecdc4' }} />
                <span>Earth Hazards</span>
              </div>
              <div className="indicator">
                <div className="indicator-dot" style={{ backgroundColor: '#95e1d3' }} />
                <span>Orbital Threats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatScore;
