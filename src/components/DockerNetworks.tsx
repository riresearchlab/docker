import { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Globe, Shield, Zap, Copy, Play, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface NetworkCommand {
  command: string;
  description: string;
  output: string[];
  category: 'create' | 'list' | 'inspect' | 'connect' | 'disconnect' | 'remove';
}

const networkCommands: NetworkCommand[] = [
  {
    command: 'docker network ls',
    description: 'List all Docker networks on the system',
    category: 'list',
    output: [
      'NETWORK ID     NAME      DRIVER    SCOPE',
      '2f259bab93aa   bridge    bridge    local',
      '17e324f45978   host      host      local',
      '098520f7a9d6   none      null      local',
      '1a5d4c8e9b32   my-app    bridge    local'
    ]
  },
  {
    command: 'docker network create my-network',
    description: 'Create a custom bridge network for container communication',
    category: 'create',
    output: [
      '1a5d4c8e9b32f7a8c6d2e4f9b7a3c5d8e9f2a1b4c7d8e5f2a9b6c3d7e8f1a2b5c4d6e9f3a7'
    ]
  },
  {
    command: 'docker network create --driver bridge --subnet=172.20.0.0/16 custom-network',
    description: 'Create a network with custom subnet configuration',
    category: 'create',
    output: [
      '7c8f9e2a1b4d5c6e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9'
    ]
  },
  {
    command: 'docker network inspect bridge',
    description: 'Inspect detailed configuration of the default bridge network',
    category: 'inspect',
    output: [
      '[',
      '    {',
      '        "Name": "bridge",',
      '        "Id": "2f259bab93aa",',
      '        "Created": "2024-01-15T10:30:15Z",',
      '        "Scope": "local",',
      '        "Driver": "bridge",',
      '        "IPAM": {',
      '            "Config": [',
      '                {',
      '                    "Subnet": "172.17.0.0/16",',
      '                    "Gateway": "172.17.0.1"',
      '                }',
      '            ]',
      '        },',
      '        "Containers": {',
      '            "7f9c8d5a1b3e": {',
      '                "Name": "nginx-server",',
      '                "IPv4Address": "172.17.0.2/16"',
      '            }',
      '        }',
      '    }',
      ']'
    ]
  },
  {
    command: 'docker network connect my-network nginx-container',
    description: 'Connect an existing container to a custom network',
    category: 'connect',
    output: [
      'Successfully connected nginx-container to my-network'
    ]
  },
  {
    command: 'docker run -d --network my-network --name web-app nginx',
    description: 'Run container directly connected to custom network',
    category: 'connect',
    output: [
      'Unable to find image \'nginx:latest\' locally',
      'latest: Pulling from library/nginx',
      'Status: Downloaded newer image for nginx:latest',
      '4a7c8e9f2b5d1a3c6e8f9b2a4c7d5e8f1a3b6c9d2e5f8a1b4c7e0d3f6a9b2c5e8f1a4b7c0d3'
    ]
  },
  {
    command: 'docker network disconnect my-network nginx-container',
    description: 'Disconnect a container from a custom network',
    category: 'disconnect',
    output: [
      'Successfully disconnected nginx-container from my-network'
    ]
  },
  {
    command: 'docker network rm my-network',
    description: 'Remove a custom network (no containers should be connected)',
    category: 'remove',
    output: [
      'my-network'
    ]
  },
  {
    command: 'docker network rm custom-net app-network',
    description: 'Remove multiple networks at once',
    category: 'remove',
    output: [
      'custom-net',
      'app-network'
    ]
  },
  {
    command: 'docker network prune',
    description: 'Remove all unused networks (not connected to any containers)',
    category: 'remove',
    output: [
      'WARNING! This will remove all custom networks not used by at least one container.',
      'Are you sure you want to continue? [y/N] y',
      'Deleted Networks:',
      'old-network',
      'unused-net',
      'temp-network'
    ]
  }
];

const networkTypes = [
  {
    name: 'Bridge',
    icon: <Network className="w-6 h-6" />,
    description: 'Default network driver for standalone containers',
    features: ['Container isolation', 'Inter-container communication', 'Port mapping'],
    useCase: 'Single-host container communication'
  },
  {
    name: 'Host',
    icon: <Globe className="w-6 h-6" />,
    description: 'Container shares the host network stack',
    features: ['No network isolation', 'Direct host access', 'Better performance'],
    useCase: 'High-performance networking requirements'
  },
  {
    name: 'None',
    icon: <Shield className="w-6 h-6" />,
    description: 'Completely isolated network with no external access',
    features: ['Complete isolation', 'No network access', 'Maximum security'],
    useCase: 'Security-sensitive applications'
  },
  {
    name: 'Overlay',
    icon: <Zap className="w-6 h-6" />,
    description: 'Multi-host networking for Docker Swarm',
    features: ['Multi-host communication', 'Service discovery', 'Load balancing'],
    useCase: 'Docker Swarm clusters'
  }
];

const DockerNetworks = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<Array<{command: string, output: string[]}>>([]);

  const categories = [
    { id: 'all', label: 'All Commands' },
    { id: 'list', label: 'List & Inspect' },
    { id: 'create', label: 'Create Networks' },
    { id: 'connect', label: 'Connect Containers' },
    { id: 'disconnect', label: 'Disconnect' },
    { id: 'remove', label: 'Remove Networks' }
  ];

  const filteredCommands = selectedCategory === 'all' 
    ? networkCommands 
    : networkCommands.filter(cmd => cmd.category === selectedCategory);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  const executeCommand = async (cmd: NetworkCommand) => {
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
          Docker <span className="text-gradient">Networks</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Master container networking with Docker's powerful network drivers. Enable secure communication 
          between containers, across hosts, and with the outside world.
        </p>
      </motion.div>

      {/* Network Types */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {networkTypes.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="container-surface p-6 text-center group hover:container-active transition-all duration-300"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <div className="text-primary">
                {type.icon}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
            
            <div className="space-y-2">
              {type.features.map((feature, idx) => (
                <div key={idx} className="text-xs bg-secondary/50 px-2 py-1 rounded">
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
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

      {/* Network Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Command List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Network Commands
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
            <span className="text-sm text-muted-foreground ml-4">Docker Network Terminal</span>
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
                {/* Only add new prompt after the last command and when not executing */}
                {!isExecuting && historyIndex === commandHistory.length - 1 && (
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

      {/* Network Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 container-surface p-8"
      >
        <h3 className="text-xl font-semibold mb-6 text-center">Network Architecture</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Network className="w-10 h-10 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Host Network</h4>
            <p className="text-sm text-muted-foreground">Docker host system</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-xs font-mono">C1</span>
              </div>
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-xs font-mono">C2</span>
              </div>
            </div>
            <h4 className="font-semibold mb-2">Bridge Network</h4>
            <p className="text-sm text-muted-foreground">Isolated container network</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">External Network</h4>
            <p className="text-sm text-muted-foreground">Internet & external services</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <h5 className="font-medium mb-2">🔗 Bridge Network Features</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic container DNS resolution</li>
              <li>• Inter-container communication</li>
              <li>• Port publishing to host</li>
              <li>• Network isolation from host</li>
            </ul>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg">
            <h5 className="font-medium mb-2">⚡ Performance Tips</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use custom networks for better isolation</li>
              <li>• Avoid default bridge for production</li>
              <li>• Enable container name resolution</li>
              <li>• Configure proper subnet sizing</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DockerNetworks;