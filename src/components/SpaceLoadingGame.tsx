import React, { useRef, useEffect, useState, useCallback } from 'react';
import '../styles/SpaceLoadingGame.css';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Collectible {
  x: number;
  y: number;
  size: number;
  speed: number;
  type: 'fuel' | 'shield' | 'boost';
  pulse: number;
}

interface SpaceLoadingGameProps {
  onComplete?: () => void;
  loadingProgress?: number;
}

const SpaceLoadingGame: React.FC<SpaceLoadingGameProps> = ({ onComplete, loadingProgress = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('astra-game-highscore');
    return saved ? parseInt(saved) : 0;
  });
  
  const gameState = useRef({
    ship: { x: 0, y: 0, targetX: 0, targetY: 0, tilt: 0, shield: false, boost: false },
    stars: [] as Star[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    collectibles: [] as Collectible[],
    score: 0,
    gameOver: false,
    shieldTimer: 0,
    boostTimer: 0,
    difficulty: 1,
    frameCount: 0,
  });

  const createExplosion = useCallback((x: number, y: number, color: string, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      gameState.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    gameState.current = {
      ship: { 
        x: canvas.width / 2, 
        y: canvas.height - 100, 
        targetX: canvas.width / 2, 
        targetY: canvas.height - 100,
        tilt: 0,
        shield: false,
        boost: false
      },
      stars: [],
      asteroids: [],
      particles: [],
      collectibles: [],
      score: 0,
      gameOver: false,
      shieldTimer: 0,
      boostTimer: 0,
      difficulty: 1,
      frameCount: 0,
    };

    // Initialize stars
    for (let i = 0; i < 150; i++) {
      gameState.current.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 3 + 1,
      });
    }

    setScore(0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (!gameStarted) {
        gameState.current.ship.x = canvas.width / 2;
        gameState.current.ship.y = canvas.height - 100;
        gameState.current.ship.targetX = canvas.width / 2;
        gameState.current.ship.targetY = canvas.height - 100;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize stars
    for (let i = 0; i < 150; i++) {
      gameState.current.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 3 + 1,
      });
    }

    // Mouse/Touch controls
    const handleMove = (clientX: number, clientY: number) => {
      if (!gameStarted || gameState.current.gameOver) return;
      const rect = canvas.getBoundingClientRect();
      gameState.current.ship.targetX = clientX - rect.left;
      gameState.current.ship.targetY = clientY - rect.top;
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Game loop
    let animationId: number;

    const drawShip = (x: number, y: number, tilt: number, shield: boolean, boost: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt * 0.1);

      // Engine flame
      const flameSize = 15 + Math.sin(gameState.current.frameCount * 0.5) * 5;
      const gradient = ctx.createLinearGradient(0, 20, 0, 20 + flameSize + (boost ? 20 : 0));
      gradient.addColorStop(0, '#ff6b35');
      gradient.addColorStop(0.5, '#f7c600');
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.moveTo(-8, 20);
      ctx.quadraticCurveTo(0, 20 + flameSize + (boost ? 20 : 0), 8, 20);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Ship body
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(-15, 20);
      ctx.lineTo(-8, 15);
      ctx.lineTo(0, 20);
      ctx.lineTo(8, 15);
      ctx.lineTo(15, 20);
      ctx.closePath();

      const shipGradient = ctx.createLinearGradient(0, -25, 0, 20);
      shipGradient.addColorStop(0, '#4ecdc4');
      shipGradient.addColorStop(0.5, '#44a3aa');
      shipGradient.addColorStop(1, '#2d7a7a');
      ctx.fillStyle = shipGradient;
      ctx.fill();

      // Cockpit
      ctx.beginPath();
      ctx.ellipse(0, -5, 5, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#87ceeb';
      ctx.fill();

      // Ship glow
      ctx.shadowColor = '#4ecdc4';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Shield effect
      if (shield) {
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(gameState.current.frameCount * 0.2) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
        ctx.fill();
      }

      ctx.restore();
    };

    const drawAsteroid = (asteroid: Asteroid) => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);

      const points = 8;
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i) / points;
        const variation = 0.7 + ((asteroid.type * i) % 3) * 0.15;
        const r = asteroid.size * variation;
        if (i === 0) {
          ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        } else {
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.size);
      gradient.addColorStop(0, '#8b7355');
      gradient.addColorStop(0.5, '#6b5344');
      gradient.addColorStop(1, '#4a3728');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#3a2718';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Craters
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(asteroid.size * 0.3, -asteroid.size * 0.2, asteroid.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-asteroid.size * 0.2, asteroid.size * 0.3, asteroid.size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawCollectible = (item: Collectible) => {
      ctx.save();
      ctx.translate(item.x, item.y);

      const pulse = 1 + Math.sin(item.pulse) * 0.1;
      ctx.scale(pulse, pulse);

      // Glow
      ctx.shadowBlur = 15;
      
      if (item.type === 'fuel') {
        ctx.shadowColor = '#f7c600';
        ctx.fillStyle = '#f7c600';
        ctx.beginPath();
        ctx.moveTo(0, -item.size);
        ctx.lineTo(item.size * 0.6, item.size * 0.5);
        ctx.lineTo(-item.size * 0.6, item.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'shield') {
        ctx.shadowColor = '#64c8ff';
        ctx.strokeStyle = '#64c8ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, item.size * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, item.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#64c8ff';
        ctx.fill();
      } else if (item.type === 'boost') {
        ctx.shadowColor = '#ff6b35';
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(0, -item.size);
        ctx.lineTo(item.size * 0.3, -item.size * 0.3);
        ctx.lineTo(item.size, -item.size * 0.3);
        ctx.lineTo(item.size * 0.4, item.size * 0.2);
        ctx.lineTo(item.size * 0.6, item.size);
        ctx.lineTo(0, item.size * 0.4);
        ctx.lineTo(-item.size * 0.6, item.size);
        ctx.lineTo(-item.size * 0.4, item.size * 0.2);
        ctx.lineTo(-item.size, -item.size * 0.3);
        ctx.lineTo(-item.size * 0.3, -item.size * 0.3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const gameLoop = () => {
      const state = gameState.current;
      state.frameCount++;

      // Clear canvas
      ctx.fillStyle = '#030810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      state.stars.forEach(star => {
        star.y += star.speed * (state.ship.boost ? 2 : 1);
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        const twinkle = 0.5 + Math.sin(state.frameCount * 0.1 + star.x) * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.fill();
      });

      // Draw nebula effect
      const nebulaGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, 300
      );
      nebulaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      nebulaGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameStarted && !state.gameOver) {
        // Update difficulty
        state.difficulty = 1 + state.score / 500;

        // Smooth ship movement
        const dx = state.ship.targetX - state.ship.x;
        const dy = state.ship.targetY - state.ship.y;
        state.ship.x += dx * 0.1;
        state.ship.y += dy * 0.08;
        state.ship.tilt = dx * 0.05;

        // Keep ship in bounds
        state.ship.x = Math.max(20, Math.min(canvas.width - 20, state.ship.x));
        state.ship.y = Math.max(50, Math.min(canvas.height - 30, state.ship.y));

        // Update timers
        if (state.shieldTimer > 0) {
          state.shieldTimer--;
          state.ship.shield = true;
        } else {
          state.ship.shield = false;
        }

        if (state.boostTimer > 0) {
          state.boostTimer--;
          state.ship.boost = true;
        } else {
          state.ship.boost = false;
        }

        // Spawn asteroids
        if (state.frameCount % Math.max(30, 60 - state.difficulty * 5) === 0) {
          state.asteroids.push({
            x: Math.random() * canvas.width,
            y: -50,
            size: 20 + Math.random() * 30,
            speed: 2 + Math.random() * 2 + state.difficulty * 0.3,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            type: Math.floor(Math.random() * 5),
          });
        }

        // Spawn collectibles
        if (state.frameCount % 180 === 0 && Math.random() > 0.3) {
          const types: ('fuel' | 'shield' | 'boost')[] = ['fuel', 'shield', 'boost'];
          state.collectibles.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: -30,
            size: 15,
            speed: 2,
            type: types[Math.floor(Math.random() * types.length)],
            pulse: 0,
          });
        }

        // Update and draw asteroids
        state.asteroids = state.asteroids.filter(asteroid => {
          asteroid.y += asteroid.speed * (state.ship.boost ? 1.5 : 1);
          asteroid.rotation += asteroid.rotationSpeed;

          // Collision detection
          const dist = Math.hypot(asteroid.x - state.ship.x, asteroid.y - state.ship.y);
          if (dist < asteroid.size + 15) {
            if (state.ship.shield) {
              createExplosion(asteroid.x, asteroid.y, '#64c8ff', 15);
              state.score += 50;
              return false;
            } else {
              state.gameOver = true;
              createExplosion(state.ship.x, state.ship.y, '#ff6b35', 40);
              if (state.score > highScore) {
                setHighScore(state.score);
                localStorage.setItem('astra-game-highscore', state.score.toString());
              }
            }
          }

          if (asteroid.y > canvas.height + 50) {
            state.score += 10;
            return false;
          }

          drawAsteroid(asteroid);
          return true;
        });

        // Update and draw collectibles
        state.collectibles = state.collectibles.filter(item => {
          item.y += item.speed;
          item.pulse += 0.15;

          // Collection detection
          const dist = Math.hypot(item.x - state.ship.x, item.y - state.ship.y);
          if (dist < item.size + 20) {
            if (item.type === 'fuel') {
              state.score += 100;
              createExplosion(item.x, item.y, '#f7c600', 10);
            } else if (item.type === 'shield') {
              state.shieldTimer = 300;
              createExplosion(item.x, item.y, '#64c8ff', 10);
            } else if (item.type === 'boost') {
              state.boostTimer = 180;
              createExplosion(item.x, item.y, '#ff6b35', 10);
            }
            return false;
          }

          if (item.y > canvas.height + 30) return false;

          drawCollectible(item);
          return true;
        });

        // Update score display
        state.score += state.ship.boost ? 2 : 1;
        setScore(state.score);
      }

      // Update and draw particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.05;

        if (p.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba');
        ctx.fill();
        return true;
      });

      // Draw ship (always visible for demo)
      if (!state.gameOver) {
        drawShip(state.ship.x, state.ship.y, state.ship.tilt, state.ship.shield, state.ship.boost);

        // Engine trail particles
        if (gameStarted && state.frameCount % 3 === 0) {
          state.particles.push({
            x: state.ship.x + (Math.random() - 0.5) * 10,
            y: state.ship.y + 25,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1,
            life: 0.8,
            color: state.ship.boost ? 'rgb(255, 107, 53)' : 'rgb(247, 198, 0)',
          });
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameStarted, createExplosion, highScore]);

  const handleStart = () => {
    resetGame();
    setGameStarted(true);
  };

  const handleRestart = () => {
    resetGame();
    gameState.current.gameOver = false;
  };

  return (
    <div className="space-loading-game">
      <canvas ref={canvasRef} className="game-canvas" />
      
      {/* UI Overlay */}
      <div className="game-ui">
        {/* Loading Progress */}
        <div className="loading-section">
          <div className="loading-bar-container">
            <div className="loading-bar" style={{ width: `${loadingProgress}%` }} />
          </div>
          <span className="loading-text">
            {loadingProgress < 100 ? `INITIALIZING ASTRA NET... ${loadingProgress}%` : 'READY TO LAUNCH'}
          </span>
        </div>

        {!gameStarted && !gameState.current.gameOver && (
          <div className="start-screen">
            <div className="game-logo">
              <div className="logo-icon">🚀</div>
              <h1>ASTEROID DODGE</h1>
              <p>Navigate through the asteroid field!</p>
            </div>
            <button className="start-btn" onClick={handleStart}>
              <span>START MISSION</span>
              <div className="btn-glow" />
            </button>
            <div className="instructions">
              <p>🖱️ Move mouse to control ship</p>
              <p>⭐ Collect power-ups for bonuses</p>
              <p>🛡️ Shield protects from asteroids</p>
            </div>
            {highScore > 0 && (
              <div className="high-score-display">
                <span>🏆 HIGH SCORE: {highScore}</span>
              </div>
            )}
          </div>
        )}

        {gameStarted && !gameState.current.gameOver && (
          <div className="hud">
            <div className="score-display">
              <span className="score-label">SCORE</span>
              <span className="score-value">{score}</span>
            </div>
            {gameState.current.ship.shield && (
              <div className="powerup-indicator shield">🛡️ SHIELD ACTIVE</div>
            )}
            {gameState.current.ship.boost && (
              <div className="powerup-indicator boost">🔥 BOOST ACTIVE</div>
            )}
          </div>
        )}

        {gameState.current.gameOver && (
          <div className="game-over-screen">
            <h2>MISSION FAILED</h2>
            <div className="final-score">
              <span>FINAL SCORE</span>
              <span className="score">{score}</span>
            </div>
            {score >= highScore && score > 0 && (
              <div className="new-record">🏆 NEW HIGH SCORE!</div>
            )}
            <button className="restart-btn" onClick={handleRestart}>
              <span>TRY AGAIN</span>
            </button>
            {loadingProgress >= 100 && onComplete && (
              <button className="continue-btn" onClick={onComplete}>
                <span>ENTER ASTRA NET →</span>
              </button>
            )}
          </div>
        )}

        {loadingProgress >= 100 && gameStarted && !gameState.current.gameOver && (
          <button className="skip-btn" onClick={onComplete}>
            SKIP → ENTER ASTRA NET
          </button>
        )}
      </div>

      {/* Decorative elements */}
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />
    </div>
  );
};

export default SpaceLoadingGame;
