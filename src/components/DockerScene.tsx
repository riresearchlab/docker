import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Text3D, Center } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const AnimatedContainer = ({ position, color, scale = 1, delay = 0 }: { 
  position: [number, number, number], 
  color: string, 
  scale?: number,
  delay?: number 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + delay) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.05;
      
      if (hovered) {
        meshRef.current.scale.setScalar(scale * 1.1);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <Box
      ref={meshRef}
      position={position}
      args={[1, 0.8, 1]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.2 : 0}
        roughness={0.3}
        metalness={0.7}
      />
    </Box>
  );
};

const NetworkConnection = ({ start, end, color = '#00d2ff' }: { 
  start: [number, number, number], 
  end: [number, number, number],
  color?: string 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  // Calculate distance and position for the connection cylinder
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[1] - start[1], 2) + 
    Math.pow(end[2] - start[2], 2)
  );
  
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ];

  return (
    <Cylinder
      ref={meshRef}
      position={midpoint}
      args={[0.02, 0.02, distance, 8]}
      rotation={[
        Math.atan2(end[1] - start[1], Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2))),
        Math.atan2(end[0] - start[0], end[2] - start[2]),
        0
      ]}
    >
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </Cylinder>
  );
};

const DockerArchitecture = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Host Operating System */}
      <Box position={[0, -3, 0]} args={[8, 0.3, 4]}>
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} metalness={0.2} />
      </Box>
      
      {/* Docker Engine */}
      <Box position={[0, -2.3, 0]} args={[7.5, 0.4, 3.5]}>
        <meshStandardMaterial 
          color="#00d2ff" 
          opacity={0.8} 
          transparent 
          emissive="#003d5c"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.9}
        />
      </Box>
      
      {/* Container Layer */}
      <Box position={[0, -1.7, 0]} args={[7, 0.2, 3]}>
        <meshStandardMaterial color="#0099cc" opacity={0.6} transparent />
      </Box>
      
      {/* Running Containers */}
      <AnimatedContainer position={[-2.5, -1, 0]} color="#e74c3c" scale={0.9} delay={0} />
      <AnimatedContainer position={[-0.8, -1, 0]} color="#2ecc71" scale={0.9} delay={0.5} />
      <AnimatedContainer position={[0.8, -1, 0]} color="#f39c12" scale={0.9} delay={1} />
      <AnimatedContainer position={[2.5, -1, 0]} color="#9b59b6" scale={0.9} delay={1.5} />
      
      {/* Container Images Stack */}
      <AnimatedContainer position={[-2.5, -0.2, 1.5]} color="#34495e" scale={0.7} delay={2} />
      <AnimatedContainer position={[-0.8, -0.2, 1.5]} color="#34495e" scale={0.7} delay={2.2} />
      <AnimatedContainer position={[0.8, -0.2, 1.5]} color="#34495e" scale={0.7} delay={2.4} />
      <AnimatedContainer position={[2.5, -0.2, 1.5]} color="#34495e" scale={0.7} delay={2.6} />
      
      {/* Registry/Hub */}
      <Cylinder position={[0, 1, -2]} args={[0.8, 0.8, 1.5, 8]}>
        <meshStandardMaterial 
          color="#ff6b6b" 
          emissive="#ff2d2d"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </Cylinder>
      
      {/* Network Connections */}
      <NetworkConnection start={[-2.5, -1, 0]} end={[0, -2.3, 0]} />
      <NetworkConnection start={[-0.8, -1, 0]} end={[0, -2.3, 0]} />
      <NetworkConnection start={[0.8, -1, 0]} end={[0, -2.3, 0]} />
      <NetworkConnection start={[2.5, -1, 0]} end={[0, -2.3, 0]} />
      
      {/* Hub to Engine */}
      <NetworkConnection start={[0, 1, -2]} end={[0, -2.3, 0]} color="#ff6b6b" />
      
      {/* Floating Data Packets */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Sphere key={i} position={[
          Math.sin(i * Math.PI / 3) * 3,
          Math.sin(i * 2) * 0.5,
          Math.cos(i * Math.PI / 3) * 2
        ]} args={[0.05]}>
          <meshStandardMaterial 
            color="#00ff88" 
            emissive="#00ff88"
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
};

const DockerScene = () => {
  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden container-elevated">
      <Canvas camera={{ position: [12, 6, 12], fov: 50 }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.4} color="#00d2ff" />
        <pointLight position={[5, 5, -5]} intensity={0.4} color="#ff6b6b" />
        <spotLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" angle={0.3} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#1a1a2e', 15, 30]} />
        
        <DockerArchitecture />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          minDistance={8}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.3}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default DockerScene;