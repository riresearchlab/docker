import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Play, FileText, Layers, Network, HardDrive, Settings, X, Square, Circle } from 'lucide-react';
import { toast } from 'sonner';

const dockerComposeExample = `version: '3.8'

services:
  # Frontend React App
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend
    networks:
      - app-network

  # Backend Node.js API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgres://user:password@db:5432/myapp
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - redis
    networks:
      - app-network

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge`;

const services = [
  { 
    name: 'nginx', 
    color: '#10b981', 
    ports: ['80:80', '443:443'],
    image: 'nginx:alpine',
    volumes: ['./nginx.conf:/etc/nginx/nginx.conf'],
    position: { x: 50, y: 20 }
  },
  { 
    name: 'frontend', 
    color: '#3b82f6', 
    ports: ['3000:3000'],
    image: 'custom build',
    volumes: [],
    position: { x: 20, y: 50 }
  },
  { 
    name: 'backend', 
    color: '#f59e0b', 
    ports: ['5000:5000'],
    image: 'custom build',
    volumes: [],
    position: { x: 80, y: 50 }
  },
  { 
    name: 'db', 
    color: '#8b5cf6', 
    ports: [],
    image: 'postgres:15-alpine',
    volumes: ['postgres_data:/var/lib/postgresql/data'],
    position: { x: 20, y: 80 }
  },
  { 
    name: 'redis', 
    color: '#ef4444', 
    ports: [],
    image: 'redis:7-alpine',
    volumes: ['redis_data:/data'],
    position: { x: 80, y: 80 }
  }
];

const volumes = [
  { name: 'postgres_data', color: '#8b5cf6', connectedTo: ['db'] },
  { name: 'redis_data', color: '#ef4444', connectedTo: ['redis'] }
];

const ServiceModal = ({ service, onClose }: { service: any, onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="container-surface p-6 rounded-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: service.color }}
            />
            {service.name}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Image:</span>
            <p className="font-mono text-sm bg-secondary/50 p-2 rounded mt-1">{service.image}</p>
          </div>
          
          {service.ports.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Ports:</span>
              <ul className="mt-1 space-y-1">
                {service.ports.map((port: string, i: number) => (
                  <li key={i} className="font-mono text-sm bg-secondary/50 p-2 rounded">
                    {port}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {service.volumes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Volumes:</span>
              <ul className="mt-1 space-y-1">
                {service.volumes.map((volume: string, i: number) => (
                  <li key={i} className="font-mono text-sm bg-secondary/50 p-2 rounded">
                    {volume}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const DockerCompose = () => {
  const [selectedView, setSelectedView] = useState<'overall' | 'services' | 'networking' | 'volumes'>('overall');
  const [animationStep, setAnimationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);

  const animationSteps = [
    { name: 'Parsing YAML', lines: [1, 2] },
    { name: 'Creating Services', lines: [8, 10, 24, 40, 53, 62] },
    { name: 'Setting up Networks', lines: [80, 81] },
    { name: 'Mounting Volumes', lines: [76, 77] },
    { name: 'Port Mapping', lines: [14, 28, 64, 65] },
    { name: 'Complete', lines: [] }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const runCompose = () => {
    setIsRunning(true);
    setAnimationStep(0);
    
    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= animationSteps.length - 1) {
          clearInterval(interval);
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const stopCompose = () => {
    setAnimationStep(0);
    setIsRunning(false);
    setHighlightedLines([]);
  };

  useEffect(() => {
    if (animationStep < animationSteps.length) {
      setHighlightedLines(animationSteps[animationStep].lines);
    }
  }, [animationStep]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Docker <span className="text-gradient">Compose</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Orchestrate multi-container applications with a single YAML file. Define your entire stack and manage it with simple commands.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Panel - YAML Editor */}
        <div className="container-elevated rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold">docker-compose.yml</span>
            </div>
            <button
              onClick={() => copyToClipboard(dockerComposeExample)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          
          <div className="p-4 bg-terminal-bg text-terminal-text overflow-auto max-h-[600px]">
            <pre className="text-xs font-mono leading-relaxed">
              {dockerComposeExample.split('\n').map((line, index) => (
                <div
                  key={index}
                  className={`${
                    highlightedLines.includes(index + 1) 
                      ? 'bg-primary/20 border-l-2 border-primary' 
                      : ''
                  } px-2 py-0.5 transition-all duration-300`}
                >
                  <span className="text-muted-foreground mr-4 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <code>{line}</code>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div className="container-elevated rounded-lg overflow-hidden">
          {/* View Tabs */}
          <div className="flex border-b border-border bg-secondary/30">
            {[
              { key: 'overall', icon: Layers, label: 'Overall' },
              { key: 'services', icon: Square, label: 'Services' },
              { key: 'networking', icon: Network, label: 'Networks' },
              { key: 'volumes', icon: HardDrive, label: 'Volumes' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-all duration-300 ${
                  selectedView === key 
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                    : 'hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Visualization Area */}
          <div className="p-6 bg-gradient-to-br from-background to-secondary/20 min-h-[400px] relative">
            {/* Host Machine */}
            <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <span className="absolute -top-3 left-4 bg-background px-2 text-sm text-muted-foreground">
                Host Machine
              </span>
            </div>

            {/* Network Overlay */}
            {(selectedView === 'overall' || selectedView === 'networking') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: animationStep >= 2 ? 0.3 : 0 }}
                className="absolute inset-8 border-2 border-primary/50 rounded-lg bg-primary/5"
              >
                <span className="absolute -top-3 left-4 bg-background px-2 text-sm text-primary">
                  app-network
                </span>
              </motion.div>
            )}

            {/* Services */}
            <AnimatePresence>
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: animationStep >= 1 ? 1 : 0, 
                    opacity: animationStep >= 1 ? 1 : 0 
                  }}
                  transition={{ delay: index * 0.2 }}
                  className="absolute w-16 h-16 cursor-pointer"
                  style={{
                    left: `${service.position.x}%`,
                    top: `${service.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedService(service)}
                >
                  <div 
                    className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg hover:scale-110 transition-transform"
                    style={{ backgroundColor: service.color }}
                  >
                    {service.name}
                  </div>
                  
                  {/* Port Indicators */}
                  {service.ports.length > 0 && (selectedView === 'overall' || selectedView === 'services') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: animationStep >= 4 ? 1 : 0 }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs text-white">P</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Volumes */}
            {(selectedView === 'overall' || selectedView === 'volumes') && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-4">
                  {volumes.map((volume, index) => (
                    <motion.div
                      key={volume.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: animationStep >= 3 ? 1 : 0,
                        y: animationStep >= 3 ? 0 : 20
                      }}
                      transition={{ delay: index * 0.3 }}
                      className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2"
                    >
                      <HardDrive className="w-4 h-4" style={{ color: volume.color }} />
                      <span className="text-xs font-mono">{volume.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Animation Status */}
            {isRunning && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm">
                {animationSteps[animationStep]?.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="container-surface p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Docker Compose Controls</h3>
          <div className="flex gap-2">
            <button
              onClick={runCompose}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              docker compose up
            </button>
            <button
              onClick={stopCompose}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <Square className="w-4 h-4" />
              docker compose down
            </button>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{animationStep} / {animationSteps.length - 1}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(animationStep / (animationSteps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {animationSteps.map((step, index) => (
              <span key={index} className={index <= animationStep ? 'text-primary' : ''}>
                {step.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};

export default DockerCompose;