import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

const ContainerBox = ({ position, color, scale = 1 }: { position: [number, number, number], color: string, scale?: number }) => {
  const meshRef = useRef();

  return (
    <Box
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      args={[1, 0.6, 1]}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
};

const ServerRack = () => {
  return (
    <group>
      {/* Server base */}
      <Box position={[0, -2, 0]} args={[6, 0.2, 3]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
      
      {/* Docker Engine layer */}
      <Box position={[0, -1.5, 0]} args={[6, 0.3, 3]}>
        <meshStandardMaterial color="#00d2ff" opacity={0.7} transparent />
      </Box>
      
      {/* Container instances */}
      <ContainerBox position={[-2, -0.8, 0]} color="#ff6b6b" scale={0.8} />
      <ContainerBox position={[0, -0.8, 0]} color="#4ecdc4" scale={0.8} />
      <ContainerBox position={[2, -0.8, 0]} color="#45b7d1" scale={0.8} />
      <ContainerBox position={[-1, -0.2, 0]} color="#96ceb4" scale={0.8} />
      <ContainerBox position={[1, -0.2, 0]} color="#ffeaa7" scale={0.8} />
    </group>
  );
};

const DockerScene = () => {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden container-elevated">
      <Canvas camera={{ position: [8, 4, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d2ff" />
        
        <ServerRack />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={6}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default DockerScene;