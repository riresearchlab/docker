import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Play, FileText, Layers } from 'lucide-react';
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

const composeCommands = [
  {
    command: 'docker compose up',
    description: 'Build, create, start, and attach to containers for a service'
  },
  {
    command: 'docker compose up -d',
    description: 'Run containers in detached mode (in the background)'
  },
  {
    command: 'docker compose down',
    description: 'Stop and remove containers, networks, images, and volumes'
  },
  {
    command: 'docker compose ps',
    description: 'List containers for the Compose project'
  },
  {
    command: 'docker compose logs',
    description: 'View output from containers'
  },
  {
    command: 'docker compose exec backend bash',
    description: 'Execute a command in a running service container'
  },
  {
    command: 'docker compose build',
    description: 'Build or rebuild services'
  },
  {
    command: 'docker compose pull',
    description: 'Pull service images'
  }
];

const DockerCompose = () => {
  const [selectedTab, setSelectedTab] = useState<'yaml' | 'commands'>('yaml');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

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
          Orchestrate multi-container applications with a single YAML file. 
          Define your entire stack and manage it with simple commands.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="container-surface p-1 rounded-lg flex">
          <button
            onClick={() => setSelectedTab('yaml')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 ${
              selectedTab === 'yaml' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            docker-compose.yml
          </button>
          <button
            onClick={() => setSelectedTab('commands')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 ${
              selectedTab === 'commands' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Commands
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedTab === 'yaml' ? (
          <div className="container-elevated rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-semibold">docker-compose.yml</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Full Stack Example
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(dockerComposeExample)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            
            <div className="p-6 bg-terminal-bg text-terminal-text overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <code>{dockerComposeExample}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {composeCommands.map((cmd, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="container-surface p-6 group hover:container-active transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <code className="text-primary font-mono text-sm bg-primary/10 px-3 py-1.5 rounded-lg">
                    {cmd.command}
                  </code>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(cmd.command)}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{cmd.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Key Concepts */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="container-surface p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Multi-Service</h3>
          <p className="text-sm text-muted-foreground">
            Define multiple interconnected services in a single file
          </p>
        </div>

        <div className="container-surface p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Declarative</h3>
          <p className="text-sm text-muted-foreground">
            Describe your desired state, not the steps to get there
          </p>
        </div>

        <div className="container-surface p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Simple</h3>
          <p className="text-sm text-muted-foreground">
            One command to start your entire application stack
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DockerCompose;