import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Download, Play, Eye, Info, Terminal, X } from 'lucide-react';
import { toast } from 'sonner';

interface DockerImage {
  name: string;
  description: string;
  category: string;
  pulls: string;
  icon: string;
  official: boolean;
  tags: string[];
  size: string;
  ports: string[];
  volumes: string[];
  envVars: string[];
  runExample: string;
  psOutput: string[];
}

const dockerImages: DockerImage[] = [
  {
    name: 'nginx',
    description: 'High-performance web server and reverse proxy',
    category: 'Web Servers',
    pulls: '1B+',
    icon: '🌐',
    official: true,
    tags: ['latest', '1.25', 'alpine', 'stable'],
    size: '142MB',
    ports: ['80', '443'],
    volumes: ['/usr/share/nginx/html', '/etc/nginx/conf.d'],
    envVars: ['NGINX_HOST', 'NGINX_PORT'],
    runExample: 'docker run -d -p 80:80 --name my-nginx nginx',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND                  CREATED        STATUS        PORTS                NAMES',
      '7f9c8d5a1b3e   nginx     "/docker-entrypoint.…"   2 minutes ago  Up 2 minutes  0.0.0.0:80->80/tcp   my-nginx'
    ]
  },
  {
    name: 'postgres',
    description: 'Advanced open source relational database',
    category: 'Databases',
    pulls: '1B+',
    icon: '🐘',
    official: true,
    tags: ['15', '14', '13', 'alpine'],
    size: '371MB',
    ports: ['5432'],
    volumes: ['/var/lib/postgresql/data'],
    envVars: ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'],
    runExample: 'docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password --name my-postgres postgres',
    psOutput: [
      'CONTAINER ID   IMAGE      COMMAND                  CREATED        STATUS        PORTS                   NAMES',
      '3a1e9b2c4d6f   postgres   "docker-entrypoint.s…"   5 minutes ago  Up 5 minutes  0.0.0.0:5432->5432/tcp my-postgres'
    ]
  },
  {
    name: 'node',
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    category: 'Runtimes',
    pulls: '1B+',
    icon: '🟢',
    official: true,
    tags: ['18', '20', 'alpine', 'lts'],
    size: '993MB',
    ports: ['3000', '8080'],
    volumes: ['/app', '/usr/src/app'],
    envVars: ['NODE_ENV', 'PORT'],
    runExample: 'docker run -d -p 3000:3000 --name my-node-app node:18',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND                  CREATED        STATUS        PORTS                   NAMES',
      '9a8b7c6d5e4f   node:18   "docker-entrypoint.s…"   1 minute ago   Up 1 minute   0.0.0.0:3000->3000/tcp my-node-app'
    ]
  },
  {
    name: 'redis',
    description: 'In-memory data structure store and cache',
    category: 'Databases',
    pulls: '1B+',
    icon: '🔴',
    official: true,
    tags: ['7', '6', 'alpine', 'latest'],
    size: '117MB',
    ports: ['6379'],
    volumes: ['/data'],
    envVars: ['REDIS_PASSWORD'],
    runExample: 'docker run -d -p 6379:6379 --name my-redis redis',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND                  CREATED        STATUS        PORTS                   NAMES',
      '5c4d3e2f1a0b   redis     "docker-entrypoint.s…"   3 minutes ago  Up 3 minutes  0.0.0.0:6379->6379/tcp my-redis'
    ]
  },
  {
    name: 'mysql',
    description: 'Popular open source relational database',
    category: 'Databases',
    pulls: '1B+',
    icon: '🐬',
    official: true,
    tags: ['8.0', '5.7', 'latest'],
    size: '521MB',
    ports: ['3306'],
    volumes: ['/var/lib/mysql'],
    envVars: ['MYSQL_ROOT_PASSWORD', 'MYSQL_DATABASE', 'MYSQL_USER'],
    runExample: 'docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password --name my-mysql mysql',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND                  CREATED        STATUS        PORTS                   NAMES',
      '8b7a9c8d7e6f   mysql     "docker-entrypoint.s…"   4 minutes ago  Up 4 minutes  0.0.0.0:3306->3306/tcp my-mysql'
    ]
  },
  {
    name: 'mongo',
    description: 'Document-oriented NoSQL database',
    category: 'Databases',
    pulls: '1B+',
    icon: '🍃',
    official: true,
    tags: ['6.0', '5.0', 'latest'],
    size: '695MB',
    ports: ['27017'],
    volumes: ['/data/db'],
    envVars: ['MONGO_INITDB_ROOT_USERNAME', 'MONGO_INITDB_ROOT_PASSWORD'],
    runExample: 'docker run -d -p 27017:27017 --name my-mongo mongo',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND                  CREATED        STATUS        PORTS                     NAMES',
      '2f1e0d9c8b7a   mongo     "docker-entrypoint.s…"   6 minutes ago  Up 6 minutes  0.0.0.0:27017->27017/tcp  my-mongo'
    ]
  },
  {
    name: 'python',
    description: 'High-level programming language runtime',
    category: 'Runtimes',
    pulls: '1B+',
    icon: '🐍',
    official: true,
    tags: ['3.11', '3.10', 'alpine', 'slim'],
    size: '917MB',
    ports: ['8000', '5000'],
    volumes: ['/app', '/code'],
    envVars: ['PYTHONPATH', 'FLASK_ENV'],
    runExample: 'docker run -d -p 8000:8000 --name my-python python:3.11',
    psOutput: [
      'CONTAINER ID   IMAGE        COMMAND                  CREATED        STATUS        PORTS                   NAMES',
      '6e5d4c3b2a19   python:3.11  "python3"                7 minutes ago  Up 7 minutes  0.0.0.0:8000->8000/tcp my-python'
    ]
  },
  {
    name: 'ubuntu',
    description: 'Popular Linux distribution base image',
    category: 'Operating Systems',
    pulls: '1B+',
    icon: '🐧',
    official: true,
    tags: ['22.04', '20.04', '18.04', 'latest'],
    size: '77.8MB',
    ports: [],
    volumes: [],
    envVars: ['DEBIAN_FRONTEND'],
    runExample: 'docker run -it --name my-ubuntu ubuntu bash',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND   CREATED        STATUS        PORTS     NAMES',
      '4d3c2b1a0e9f   ubuntu    "bash"    8 minutes ago  Up 8 minutes            my-ubuntu'
    ]
  },
  {
    name: 'alpine',
    description: 'Lightweight Linux distribution',
    category: 'Operating Systems',
    pulls: '1B+',
    icon: '🏔️',
    official: true,
    tags: ['3.18', '3.17', 'latest', 'edge'],
    size: '5.59MB',
    ports: [],
    volumes: [],
    envVars: ['PATH'],
    runExample: 'docker run -it --name my-alpine alpine sh',
    psOutput: [
      'CONTAINER ID   IMAGE     COMMAND   CREATED        STATUS        PORTS     NAMES',
      '1a0e9f8d7c6b   alpine    "sh"      9 minutes ago  Up 9 minutes            my-alpine'
    ]
  }
];

interface ImageModalProps {
  image: DockerImage;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ image, isOpen, onClose }: ImageModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'run' | 'ps'>('overview');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="container-elevated w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{image.icon}</div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{image.name}</h2>
                    {image.official && (
                      <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">
                        Official
                      </span>
                    )}
                    <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                      {image.size}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">{image.description}</p>
                  <p className="text-sm text-primary mt-1">{image.pulls} pulls</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'run', label: 'Run Example', icon: Play },
                { id: 'ps', label: 'Container Status', icon: Terminal }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-primary">📦</span>
                        Available Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-mono"
                          >
                            {image.name}:{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-primary">🔌</span>
                        Default Ports
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.ports.length > 0 ? (
                          image.ports.map((port) => (
                            <span
                              key={port}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-mono"
                            >
                              {port}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No exposed ports</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-primary">💾</span>
                        Volume Mounts
                      </h3>
                      <div className="space-y-1">
                        {image.volumes.length > 0 ? (
                          image.volumes.map((volume) => (
                            <code
                              key={volume}
                              className="block text-xs bg-secondary/50 px-2 py-1 rounded font-mono"
                            >
                              {volume}
                            </code>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No volume requirements</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-primary">⚙️</span>
                        Environment Variables
                      </h3>
                      <div className="space-y-1">
                        {image.envVars.length > 0 ? (
                          image.envVars.map((envVar) => (
                            <code
                              key={envVar}
                              className="block text-xs bg-secondary/50 px-2 py-1 rounded font-mono"
                            >
                              {envVar}
                            </code>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No required environment variables</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'run' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Quick Start Command</h3>
                    <div className="terminal rounded-lg">
                      <div className="terminal-header">
                        <div className="terminal-dot bg-red-500"></div>
                        <div className="terminal-dot bg-yellow-500"></div>
                        <div className="terminal-dot bg-green-500"></div>
                        <span className="text-sm text-muted-foreground ml-4">Terminal</span>
                        <div className="ml-auto">
                          <button
                            onClick={() => copyToClipboard(image.runExample)}
                            className="flex items-center gap-2 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-xs"
                          >
                            <Download className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="terminal-content">
                        <div className="command-line">
                          <span className="command-prompt">$</span>
                          <span className="text-foreground">{image.runExample}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="container-surface p-4">
                      <h4 className="font-medium mb-2">💡 Common Options</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li><code className="text-primary">-d</code> Run in detached mode</li>
                        <li><code className="text-primary">-p</code> Publish ports to host</li>
                        <li><code className="text-primary">--name</code> Assign container name</li>
                        <li><code className="text-primary">-e</code> Set environment variables</li>
                        <li><code className="text-primary">-v</code> Mount volumes</li>
                      </ul>
                    </div>

                    <div className="container-surface p-4">
                      <h4 className="font-medium mb-2">🔗 Useful Commands</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li><code className="text-primary">docker logs {image.name}</code></li>
                        <li><code className="text-primary">docker exec -it {image.name} bash</code></li>
                        <li><code className="text-primary">docker stop {image.name}</code></li>
                        <li><code className="text-primary">docker rm {image.name}</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ps' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Container Status Output</h3>
                    <div className="terminal rounded-lg">
                      <div className="terminal-header">
                        <div className="terminal-dot bg-red-500"></div>
                        <div className="terminal-dot bg-yellow-500"></div>
                        <div className="terminal-dot bg-green-500"></div>
                        <span className="text-sm text-muted-foreground ml-4">docker ps</span>
                      </div>
                      <div className="terminal-content">
                        {image.psOutput.map((line, index) => (
                          <div key={index} className="command-output font-mono text-xs">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="container-surface p-4 text-center">
                      <div className="text-2xl mb-2">🟢</div>
                      <h4 className="font-medium">Status</h4>
                      <p className="text-sm text-muted-foreground">Up and Running</p>
                    </div>

                    <div className="container-surface p-4 text-center">
                      <div className="text-2xl mb-2">🔌</div>
                      <h4 className="font-medium">Network</h4>
                      <p className="text-sm text-muted-foreground">Bridge Mode</p>
                    </div>

                    <div className="container-surface p-4 text-center">
                      <div className="text-2xl mb-2">💾</div>
                      <h4 className="font-medium">Storage</h4>
                      <p className="text-sm text-muted-foreground">Container Layer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EnhancedImageGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...Array.from(new Set(dockerImages.map(img => img.category)))];
  
  const filteredImages = dockerImages.filter(image => {
    const matchesCategory = selectedCategory === 'All' || image.category === selectedCategory;
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
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
          Popular Docker <span className="text-gradient">Images</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore {dockerImages.length} curated Docker images with detailed information, usage examples, and interactive previews.
        </p>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="image-card container-surface p-6 group cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{image.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{image.name}</h4>
                    {image.official && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Official
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{image.pulls} pulls</p>
                  <p className="text-xs text-muted-foreground">{image.size}</p>
                </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyCommand(`docker pull ${image.name}`);
                  }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {image.description}
            </p>

            {/* Tags Preview */}
            <div className="flex flex-wrap gap-1 mb-4">
              {image.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded font-mono"
                >
                  {tag}
                </span>
              ))}
              {image.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{image.tags.length - 3} more
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <code className="text-xs bg-secondary/50 px-2 py-1 rounded font-mono">
                docker pull {image.name}
              </code>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Info className="w-3 h-3" />
                View Details
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Modal */}
      <ImageModal
        image={selectedImage!}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default EnhancedImageGallery;