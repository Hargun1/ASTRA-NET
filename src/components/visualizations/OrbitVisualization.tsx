import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

// Earth component
const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Ocean
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGradient.addColorStop(0, '#1a4a6e');
    oceanGradient.addColorStop(0.5, '#0d3b5c');
    oceanGradient.addColorStop(1, '#1a4a6e');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 512, 256);

    // Continents
    ctx.fillStyle = '#2d5a3d';
    ctx.beginPath();
    ctx.ellipse(100, 80, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(140, 160, 20, 40, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(250, 70, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(260, 140, 25, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(350, 90, 60, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(330, 130, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(410, 175, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={earthTexture} />
    </mesh>
  );
};

// Orbit ring component
interface OrbitRingProps {
  radius: number;
  color: string;
  label: string;
}

const OrbitRing: React.FC<OrbitRingProps> = ({ radius, color }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
};

// Satellite component
interface SatelliteProps {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  orbitRadius: number;
  initialAngle: number;
  isDebris?: boolean;
}

const Satellite: React.FC<SatelliteProps> = ({
  color,
  size,
  speed,
  orbitRadius,
  initialAngle,
  isDebris = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = useRef(initialAngle);

  useFrame(() => {
    if (meshRef.current) {
      angle.current += speed;
      meshRef.current.position.x = Math.cos(angle.current) * orbitRadius;
      meshRef.current.position.z = Math.sin(angle.current) * orbitRadius;
      meshRef.current.position.y = Math.sin(angle.current * 2) * 0.5;
      
      if (!isDebris) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      {isDebris ? (
        <octahedronGeometry args={[size, 0]} />
      ) : (
        <boxGeometry args={[size * 2, size, size * 0.5]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isDebris ? 0.2 : 0.5}
      />
    </mesh>
  );
};

// Debris field
const DebrisField: React.FC<{ orbit: 'LEO' | 'MEO' | 'GEO'; count: number }> = ({ orbit, count }) => {
  const debrisData = useMemo(() => {
    const radiusMap = { LEO: 3.5, MEO: 6, GEO: 9 };
    const radius = radiusMap[orbit];
    
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
      speed: 0.001 + Math.random() * 0.002,
      radius: radius + (Math.random() - 0.5) * 0.5,
      size: 0.02 + Math.random() * 0.03,
    }));
  }, [orbit, count]);

  return (
    <group>
      {debrisData.map((debris, i) => (
        <Satellite
          key={i}
          position={[0, 0, 0]}
          color="#666666"
          size={debris.size}
          speed={debris.speed}
          orbitRadius={debris.radius}
          initialAngle={debris.angle}
          isDebris
        />
      ))}
    </group>
  );
};

interface OrbitVisualizationProps {
  satellites: Array<{
    id: string;
    name: string;
    type: 'active' | 'debris';
    orbit: 'LEO' | 'MEO' | 'GEO';
  }>;
}

const OrbitVisualization: React.FC<OrbitVisualizationProps> = ({ satellites }) => {
  const activeSatellites = satellites.filter(s => s.type === 'active');

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4fc3f7" />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <Earth />

        {/* Orbit rings */}
        <OrbitRing radius={3.5} color="#4ecdc4" label="LEO" />
        <OrbitRing radius={6} color="#f59e0b" label="MEO" />
        <OrbitRing radius={9} color="#8b5cf6" label="GEO" />

        {/* Active satellites */}
        {activeSatellites.map((sat, i) => {
          const radiusMap = { LEO: 3.5, MEO: 6, GEO: 9 };
          return (
            <Satellite
              key={sat.id}
              position={[0, 0, 0]}
              color={sat.orbit === 'LEO' ? '#4ecdc4' : sat.orbit === 'MEO' ? '#f59e0b' : '#8b5cf6'}
              size={0.08}
              speed={sat.orbit === 'LEO' ? 0.008 : sat.orbit === 'MEO' ? 0.004 : 0.002}
              orbitRadius={radiusMap[sat.orbit]}
              initialAngle={(i / activeSatellites.length) * Math.PI * 2}
            />
          );
        })}

        {/* Debris fields */}
        <DebrisField orbit="LEO" count={30} />
        <DebrisField orbit="MEO" count={15} />
        <DebrisField orbit="GEO" count={10} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default OrbitVisualization;
