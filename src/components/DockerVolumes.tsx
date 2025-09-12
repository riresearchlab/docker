import { useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Database, FolderOpen, Server, Copy, Play, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface VolumeCommand {
  command: string;
  description: string;
  output: string[];
  category: 'create' | 'list' | 'inspect' | 'mount' | 'remove';
}

const volumeCommands: VolumeCommand[] = [
  {
    command: 'docker volume ls',
    description: 'List all Docker volumes on the system',
    category: 'list',
    output: [
      'DRIVER    VOLUME NAME',
      'local     app-data',
      'local     postgres-data',
      'local     redis-cache',
      'local     nginx-config'
    ]
  },
  {
    command: 'docker volume create app-data',
    description: 'Create a named volume for persistent data storage',
    category: 'create',
    output: [
      'app-data'
    ]
  },
  {
    command: 'docker volume create --driver local --opt type=tmpfs app-cache',
    description: 'Create a tmpfs volume for high-speed temporary storage',
    category: 'create',
    output: [
      'app-cache'
    ]
  },
  {
    command: 'docker volume inspect app-data',
    description: 'Inspect detailed information about a specific volume',
    category: 'inspect',
    output: [
      '[',
      '    {',
      '        "CreatedAt": "2024-01-15T10:30:15Z",',
      '        "Driver": "local",',
      '        "Labels": {},',
      '        "Mountpoint": "/var/lib/docker/volumes/app-data/_data",',
      '        "Name": "app-data",',
      '        "Options": {},',
      '        "Scope": "local"',
      '    }',
      ']'
    ]
  },
  {
    command: 'docker run -d -v app-data:/data --name myapp nginx',
    description: 'Mount a named volume to a container at /data',
    category: 'mount',
    output: [
      'Unable to find image \'nginx:latest\' locally',
      'latest: Pulling from library/nginx',
      'Status: Downloaded newer image for nginx:latest',
      '2a4c6e8f9b1d3a5c7e9f2b4d6a8c1e3f5a7c9e2b4d6f8a1c3e5a7c9f2b4e6a8c1d3f5a7c9e2b4'
    ]
  },
  {
    command: 'docker run -d -v $(pwd):/app --name devapp node:18',
    description: 'Bind mount current directory to container for development',
    category: 'mount',
    output: [
      'Unable to find image \'node:18\' locally',
      '18: Pulling from library/node',
      'Status: Downloaded newer image for node:18',
      '5e7f9a1c3d5a7c9e1f3a5c7e9f1a3c5e7f9a1c3d5a7c9e1f3a5c7e9f1a3c5e7f9a1c3d5a7c9e1'
    ]
  },
  {
    command: 'docker run -d --tmpfs /tmp:noexec,nosuid,size=100m nginx',
    description: 'Mount a tmpfs filesystem for temporary data',
    category: 'mount',
    output: [
      '8c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3d5a7c9e1f3a5c7e9f1a3c5e7f9a1c3d5a7c9e1f3a5'
    ]
  },
  {
    command: 'docker volume rm app-data',
    description: 'Remove a specific volume (must not be in use by containers)',
    category: 'remove',
    output: [
      'app-data'
    ]
  },
  {
    command: 'docker volume rm postgres-data redis-cache',
    description: 'Remove multiple volumes at once',
    category: 'remove',
    output: [
      'postgres-data',
      'redis-cache'
    ]
  },
  {
    command: 'docker volume prune',
    description: 'Remove all unused volumes (not mounted by any containers)',
    category: 'remove',
    output: [
      'WARNING! This will remove all local volumes not used by at least one container.',
      'Are you sure you want to continue? [y/N] y',
      'Deleted Volumes:',
      'old-volume',
      'temp-data',
      'unused-cache',
      '',
      'Total reclaimed space: 1.2GB'
    ]
  },
  {
    command: 'docker volume rm $(docker volume ls -q)',
    description: 'Remove all volumes (advanced - use with caution)',
    category: 'remove',
    output: [
      'Error response from daemon: remove app-data: volume is in use - [7f9c8d5a1b3e]',
      'postgres-data',
      'redis-cache',
      'nginx-config'
    ]
  }
];

const volumeTypes = [
  {
    name: 'Named Volumes',
    icon: <Database className="w-6 h-6" />,
    description: 'Docker-managed volumes with automatic lifecycle',
    features: ['Persistent storage', 'Backup & restore', 'Cross-platform'],
    command: 'docker volume create my-volume',
    useCase: 'Database storage, application data'
  },
  {
    name: 'Bind Mounts',
    icon: <FolderOpen className="w-6 h-6" />,
    description: 'Direct file system mapping from host to container',
    features: ['Real-time sync', 'Development workflow', 'Full host access'],
    command: 'docker run -v /host/path:/container/path',
    useCase: 'Development, configuration files'
  },
  {
    name: 'tmpfs Mounts',
    icon: <Server className="w-6 h-6" />,
    description: 'In-memory filesystem for temporary data',
    features: ['High performance', 'Security', 'Automatic cleanup'],
    command: 'docker run --tmpfs /tmp',
    useCase: 'Temporary files, sensitive data'
  }
];

const DockerVolumes = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<Array<{command: string, output: string[]}>>([]);

  const categories = [
    { id: 'all', label: 'All Commands' },
    { id: 'list', label: 'List & Inspect' },
    { id: 'create', label: 'Create Volumes' },
    { id: 'mount', label: 'Mount & Use' },
    { id: 'remove', label: 'Remove Volumes' }
  ];

  const filteredCommands = selectedCategory === 'all' 
    ? volumeCommands 
    : volumeCommands.filter(cmd => cmd.category === selectedCategory);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  const executeCommand = async (cmd: VolumeCommand) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    
    // Add command to history
    setCommandHistory(prev => [...prev, { command: cmd.command, output: [] }]);
    
    // Simulate typing the command
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add output lines with delay
    const newOutput: string[] = [];
    for (let i = 0; i < cmd.output.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      newOutput.push(cmd.output[i]);
      setCommandHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].output = [...newOutput];
        return updated;
      });
    }
    
    setIsExecuting(false);
  };

  const clearTerminal = () => {
    setCommandHistory([]);
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
          Docker <span className="text-gradient">Volumes</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Master persistent data storage with Docker volumes. Keep your data safe across container 
          restarts, enable development workflows, and manage application state effectively.
        </p>
      </motion.div>

      {/* Volume Types */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {volumeTypes.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="container-surface p-6 group hover:container-active transition-all duration-300"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <div className="text-primary">
                {type.icon}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
            
            <div className="space-y-2 mb-4">
              {type.features.map((feature, idx) => (
                <div key={idx} className="text-xs bg-secondary/50 px-2 py-1 rounded">
                  {feature}
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <code className="text-xs bg-terminal-bg text-terminal-text px-2 py-1 rounded font-mono block mb-2">
                {type.command}
              </code>
              <p className="text-xs text-primary font-medium">{type.useCase}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Command Categories */}
      <div className="flex justify-center mb-8">
        <div className="container-surface p-1 rounded-lg flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary/50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Command List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Volume Commands
          </h3>
          
          {filteredCommands.map((cmd, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`container-surface p-4 transition-all duration-300 ${
                isExecuting ? 'container-active' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-primary font-mono text-sm bg-primary/10 px-2 py-1 rounded">
                  {cmd.command}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCommand(cmd.command);
                    }}
                    className="p-1 hover:bg-primary/10 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      executeCommand(cmd);
                    }}
                    className="p-1 hover:bg-primary/10 rounded transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{cmd.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Terminal Output */}
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500"></div>
            <div className="terminal-dot bg-yellow-500"></div>
            <div className="terminal-dot bg-green-500"></div>
            <span className="text-sm text-muted-foreground ml-4">Docker Volume Terminal</span>
            <button
              onClick={clearTerminal}
              className="ml-auto px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="terminal-content">
            {/* Show command history */}
            {commandHistory.map((historyItem, historyIndex) => (
              <div key={historyIndex} className="mb-4">
                <div className="command-line">
                  <span className="command-prompt">admin@ubuntu:~$</span>
                  <span className="text-foreground">{historyItem.command}</span>
                </div>
                {historyItem.output.map((line, lineIndex) => (
                  <motion.div
                    key={`${historyIndex}-${lineIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="command-output"
                  >
                    {line}
                  </motion.div>
                ))}
                {/* Add new prompt after completed command */}
                {!isExecuting && (
                  <div className="command-line mt-2">
                    <span className="command-prompt">admin@ubuntu:~$</span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Current executing command cursor */}
            {isExecuting && commandHistory.length > 0 && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-primary"
              >
                |
              </motion.span>
            )}
            
            {/* Empty state */}
            {!isExecuting && commandHistory.length === 0 && (
              <div className="command-line">
                <span className="command-prompt">admin@ubuntu:~$</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volume Lifecycle Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 container-surface p-8"
      >
        <h3 className="text-xl font-semibold mb-6 text-center">Volume Lifecycle</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Create', desc: 'docker volume create', icon: '📦' },
            { step: '2', title: 'Mount', desc: 'docker run -v volume:/path', icon: '🔗' },
            { step: '3', title: 'Use', desc: 'Container reads/writes data', icon: '💾' },
            { step: '4', title: 'Persist', desc: 'Data survives container restart', icon: '🔄' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 text-primary-foreground font-bold text-sm">
                {item.step}
              </div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <h5 className="font-medium mb-2">💡 Best Practices</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use named volumes for production data</li>
              <li>• Bind mounts for development workflows</li>
              <li>• Regular backups of important volumes</li>
              <li>• Proper permission management</li>
            </ul>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg">
            <h5 className="font-medium mb-2">⚠️ Common Pitfalls</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Forgetting to backup volume data</li>
              <li>• Incorrect file permissions on bind mounts</li>
              <li>• Using tmpfs for persistent data</li>
              <li>• Not cleaning up unused volumes</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DockerVolumes;