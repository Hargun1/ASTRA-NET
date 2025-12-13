import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/PlanetBackground.css';

// Earth component with rotation
const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Create Earth texture procedurally
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Ocean base
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGradient.addColorStop(0, '#1a4a6e');
    oceanGradient.addColorStop(0.5, '#0d3b5c');
    oceanGradient.addColorStop(1, '#1a4a6e');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Add continents (simplified shapes)
    ctx.fillStyle = '#2d5a3d';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(200, 150, 80, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(280, 320, 40, 70, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(500, 140, 50, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(520, 280, 50, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(700, 180, 120, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(820, 350, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // India
    ctx.beginPath();
    ctx.ellipse(660, 260, 25, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add some terrain variation
    ctx.fillStyle = '#3d6a4d';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 15 + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Create cloud texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 1024, 512);

    // Add cloud patches
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const radius = Math.random() * 40 + 20;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsed * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsed * 0.12;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = elapsed * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[5.1, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          color="#4fc3f7"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Floating particles around Earth
const Particles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(500 * 3);
    
    for (let i = 0; i < 500; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 4;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        color="#4ecdc4"
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

const PlanetBackground: React.FC = () => {
  return (
    <div className="planet-background">
      <Canvas camera={{ position: [0, 2, 15], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 5, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -5, -5]} intensity={0.3} color="#4fc3f7" />

        {/* Stars background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Earth */}
        <Earth />

        {/* Particles */}
        <Particles />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default PlanetBackground;
