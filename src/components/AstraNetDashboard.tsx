import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlanetBackground from './PlanetBackground';
import NavigationButtons from './NavigationButtons';
import ThreatScore from './ThreatScore';
import '../styles/Dashboard.css';

type ModuleType = 'aditya' | 'bhumi' | 'kaksha' | null;

const AstraNetDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(null);
  const [threatScore, setThreatScore] = useState(45);

  // Simulate threat score changes
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatScore(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleModuleSelect = (module: ModuleType) => {
    setActiveModule(module);
    console.log(`Navigating to: ${module}`);
  };

  return (
    <div className="astra-net-dashboard">
      {/* 3D Planet Background */}
      <PlanetBackground />

      {/* Main Content */}
      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <header className="astra-header">
          <motion.h1
            className="astra-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            ASTRA NET
          </motion.h1>
          <motion.p
            className="astra-subtitle"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Advanced Space Threat Response & Analysis Network
          </motion.p>
        </header>

        {/* Navigation Buttons */}
        <NavigationButtons 
          activeModule={activeModule}
          onModuleSelect={handleModuleSelect}
        />

        {/* Threat Score Area */}
        <ThreatScore score={threatScore} />

        {/* Module Info Card */}
        {activeModule && (
          <motion.div
            className="module-info-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="module-title">
              {activeModule === 'aditya' && 'Astra-Aditya: Solar Threat Intelligence'}
              {activeModule === 'bhumi' && 'Astra-Bhumi: Earth Hazard Monitoring'}
              {activeModule === 'kaksha' && 'Astra-Kaksha: Orbital Debris Analysis'}
            </h2>
            <p className="module-description">
              {activeModule === 'aditya' && 'Monitor solar flares, CMEs, and space weather conditions affecting critical infrastructure.'}
              {activeModule === 'bhumi' && 'Track floods, wildfires, landslides, and heatwaves across India using satellite data.'}
              {activeModule === 'kaksha' && 'Visualize satellites and space debris in 3D orbit with collision risk assessment.'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AstraNetDashboard;
