import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SunCore: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  // Create sun surface texture
  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#fff5e6');
    gradient.addColorStop(0.3, '#ffcc00');
    gradient.addColorStop(0.6, '#ff9900');
    gradient.addColorStop(1, '#ff6600');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add granulation
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 8 + 2;
      const alpha = Math.random() * 0.3;
      ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y = -clock.getElapsedTime() * 0.02;
      coronaRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group>
      {/* Sun core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#ff6600"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Corona layer */}
      <mesh ref={coronaRef} scale={1.3}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#ff9944"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={1.8}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#ffaa00"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Solar particles/CME
const SolarParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    const colors = new Float32Array(200 * 3);

    for (let i = 0; i < 200; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2.5 + Math.random() * 3;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i * 3 + 2] = Math.random() * 0.3;
    }

    return { positions, colors };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={200}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

interface SunVisualizationProps {
  intensity?: number;
}

const SunVisualization: React.FC<SunVisualizationProps> = ({ intensity = 0.65 }) => {
  return (
    <div style={{ width: '100%', height: '300px', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ff9900" />
        
        <SunCore />
        <SolarParticles />
      </Canvas>
    </div>
  );
};

export default SunVisualization;
