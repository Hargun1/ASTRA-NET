import React from 'react';
import { motion } from 'framer-motion';
import '../styles/NavigationButtons.css';

interface NavigationButtonsProps {
  activeModule: string | null;
  onModuleSelect: (module: 'aditya' | 'bhumi' | 'kaksha') => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  activeModule,
  onModuleSelect,
}) => {
  const buttons = [
    {
      id: 'aditya',
      title: 'ASTRA ADITYA',
      subtitle: 'Solar Threat Intelligence',
      icon: '☀️',
      color: '#e0a554',
      glowColor: 'rgba(224, 165, 84, 0.6)',
    },
    {
      id: 'bhumi',
      title: 'ASTRA BHUMI',
      subtitle: 'Earth Hazard Monitoring',
      icon: '🌍',
      color: '#4ecdc4',
      glowColor: 'rgba(78, 205, 196, 0.6)',
    },
    {
      id: 'kaksha',
      title: 'ASTRA KAKSHA',
      subtitle: 'Orbital Debris Analysis',
      icon: '🛰️',
      color: '#95e1d3',
      glowColor: 'rgba(149, 225, 211, 0.6)',
    },
  ];

  return (
    <div className="navigation-container">
      <div className="buttons-grid">
        {buttons.map((button, index) => (
          <motion.button
            key={button.id}
            className={`nav-button ${activeModule === button.id ? 'active' : ''}`}
            onClick={() => onModuleSelect(button.id as 'aditya' | 'bhumi' | 'kaksha')}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            whileHover={{
              scale: 1.08,
              y: -8,
              boxShadow: `0 0 40px ${button.glowColor}, 0 0 80px ${button.glowColor}, inset 0 0 20px ${button.color}30`,
              backgroundColor: `${button.color}25`,
              borderColor: button.color,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="button-icon"
              animate={{ rotate: activeModule === button.id ? 360 : 0 }}
              transition={{ duration: 0.8 }}
            >
              {button.icon}
            </motion.div>
            <div className="button-content">
              <h3 className="button-title">{button.title}</h3>
              <p className="button-subtitle">{button.subtitle}</p>
            </div>
            <motion.div
              className="button-border"
              style={{ borderColor: button.color }}
              animate={{
                boxShadow: activeModule === button.id
                  ? `0 0 20px ${button.color}, inset 0 0 20px ${button.color}20`
                  : 'none',
              }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default NavigationButtons;
