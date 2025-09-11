import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Whale body component
const WhaleBody = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main whale body - ellipsoid shape */}
      <Sphere position={[0, 0, 0]} args={[2, 1.2, 3]} scale={[1, 0.8, 1.2]}>
        <meshStandardMaterial 
          color="#1E90FF" 
          roughness={0.3}
          metalness={0.1}
          emissive="#0066CC"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Whale tail */}
      <group position={[0, 0.2, -2.8]} rotation={[0, 0, 0]}>
        <Box args={[1.5, 0.3, 0.8]} position={[-0.4, 0, 0]} rotation={[0, 0, 0.3]}>
          <meshStandardMaterial color="#1E90FF" roughness={0.3} metalness={0.1} />
        </Box>
        <Box args={[1.5, 0.3, 0.8]} position={[0.4, 0, 0]} rotation={[0, 0, -0.3]}>
          <meshStandardMaterial color="#1E90FF" roughness={0.3} metalness={0.1} />
        </Box>
      </group>
      
      {/* Whale fins */}
      <Box args={[0.8, 0.2, 1.2]} position={[-1.5, -0.3, 0.5]} rotation={[0, 0.3, 0.4]}>
        <meshStandardMaterial color="#1E90FF" roughness={0.3} metalness={0.1} />
      </Box>
      <Box args={[0.8, 0.2, 1.2]} position={[1.5, -0.3, 0.5]} rotation={[0, -0.3, -0.4]}>
        <meshStandardMaterial color="#1E90FF" roughness={0.3} metalness={0.1} />
      </Box>
      
      {/* Whale eyes */}
      <Sphere args={[0.15]} position={[-0.6, 0.3, 1.2]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.1]} position={[-0.65, 0.35, 1.25]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      <Sphere args={[0.15]} position={[0.6, 0.3, 1.2]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.1]} position={[0.65, 0.35, 1.25]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
    </group>
  );
};

// Container blocks on whale's back
const ContainerBlocks = () => {
  const containerPositions = [
    [-1, 0.8, 0.5],
    [-0.3, 0.8, 0.5],
    [0.4, 0.8, 0.5],
    [1.1, 0.8, 0.5],
    [-0.65, 0.8, -0.2],
    [0.05, 0.8, -0.2],
    [0.75, 0.8, -0.2],
    [-0.3, 0.8, -0.9],
    [0.4, 0.8, -0.9],
  ];

  const containerColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3'
  ];

  return (
    <>
      {containerPositions.map((position, index) => (
        <Box 
          key={index}
          position={position as [number, number, number]}
          args={[0.5, 0.4, 0.5]}
        >
          <meshStandardMaterial 
            color={containerColors[index]} 
            roughness={0.2}
            metalness={0.8}
            emissive={containerColors[index]}
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
    </>
  );
};

// Floating particles around the whale
const FloatingParticles = () => {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const radius = 5 + Math.random() * 3;
        const angle = (i / 20) * Math.PI * 2;
        return (
          <Sphere 
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(i * 0.5) * 2,
              Math.sin(angle) * radius
            ]} 
            args={[0.05]}
          >
            <meshStandardMaterial 
              color="#00D2FF" 
              emissive="#00D2FF"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </Sphere>
        );
      })}
    </>
  );
};

// Main Docker whale component
const DockerWhale = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <WhaleBody />
      <ContainerBlocks />
      <FloatingParticles />
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
        
        <DockerWhale />
        
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