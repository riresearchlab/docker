import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Database, Network, HardDrive, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface InspectData {
  Id: string;
  Name: string;
  State: {
    Status: string;
    Running: boolean;
    Pid: number;
    StartedAt: string;
    FinishedAt?: string;
  };
  Image: string;
  Config: {
    Hostname: string;
    ExposedPorts: Record<string, any>;
    Env: string[];
    Cmd: string[];
    WorkingDir: string;
  };
  NetworkSettings: {
    IPAddress: string;
    Ports: Record<string, any>;
    Networks: Record<string, any>;
  };
  Mounts: Array<{
    Type: string;
    Source: string;
    Destination: string;
    Mode: string;
    RW: boolean;
  }>;
  HostConfig: {
    Memory: number;
    CpuShares: number;
    RestartPolicy: {
      Name: string;
      MaximumRetryCount: number;
    };
  };
}

const sampleInspectData: InspectData = {
  Id: "7f9c8d5a1b3e8a9c2d5f6e8b1a4c7e9f2a1b4c7d8e5f2a9b6c3d7e8f1a2b5c4d6e9f3a7",
  Name: "/nginx-web-server",
  State: {
    Status: "running",
    Running: true,
    Pid: 12345,
    StartedAt: "2024-01-15T10:30:15.123456789Z",
  },
  Image: "sha256:b2ad206a9ee353de12daa7bc8944ea09a6b54b9b132358e94bcbca288ccc2d70",
  Config: {
    Hostname: "7f9c8d5a1b3e",
    ExposedPorts: {
      "80/tcp": {}
    },
    Env: [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "NGINX_VERSION=1.25.3",
      "NJS_VERSION=0.8.2",
      "PKG_RELEASE=1~bookworm"
    ],
    Cmd: [
      "nginx",
      "-g",
      "daemon off;"
    ],
    WorkingDir: ""
  },
  NetworkSettings: {
    IPAddress: "172.17.0.2",
    Ports: {
      "80/tcp": [
        {
          "HostIp": "0.0.0.0",
          "HostPort": "8080"
        }
      ]
    },
    Networks: {
      "bridge": {
        "IPAMConfig": null,
        "Links": null,
        "Aliases": null,
        "NetworkID": "2f259bab93aa3e7b19b1e3f4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
        "EndpointID": "8c7d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
        "Gateway": "172.17.0.1",
        "IPAddress": "172.17.0.2",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:11:00:02"
      }
    }
  },
  Mounts: [
    {
      Type: "bind",
      Source: "/home/user/nginx.conf",
      Destination: "/etc/nginx/nginx.conf",
      Mode: "",
      RW: true
    },
    {
      Type: "volume",
      Source: "nginx-logs",
      Destination: "/var/log/nginx",
      Mode: "z",
      RW: true
    }
  ],
  HostConfig: {
    Memory: 536870912,
    CpuShares: 1024,
    RestartPolicy: {
      Name: "unless-stopped",
      MaximumRetryCount: 0
    }
  }
};

const inspectSections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: <Eye className="w-5 h-5" />,
    description: 'Basic container information and status'
  },
  {
    id: 'config',
    title: 'Configuration',
    icon: <FileText className="w-5 h-5" />,
    description: 'Environment variables, commands, and settings'
  },
  {
    id: 'network',
    title: 'Network',
    icon: <Network className="w-5 h-5" />,
    description: 'IP addresses, ports, and network connections'
  },
  {
    id: 'storage',
    title: 'Storage',
    icon: <HardDrive className="w-5 h-5" />,
    description: 'Volumes, bind mounts, and filesystem details'
  },
  {
    id: 'resources',
    title: 'Resources',
    icon: <Database className="w-5 h-5" />,
    description: 'CPU, memory, and resource constraints'
  }
];

const inspectCommands = [
  {
    command: 'docker inspect nginx-container',
    description: 'Inspect all details of a container',
    category: 'container'
  },
  {
    command: 'docker inspect --format="{{.State.Status}}" nginx-container',
    description: 'Get specific field using Go template',
    category: 'format'
  },
  {
    command: 'docker inspect nginx:latest',
    description: 'Inspect an image configuration',
    category: 'image'
  },
  {
    command: 'docker inspect my-volume',
    description: 'Inspect volume details and mount point',
    category: 'volume'
  },
  {
    command: 'docker inspect bridge',
    description: 'Inspect network configuration',
    category: 'network'
  }
];

const DockerInspect = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCommand, setSelectedCommand] = useState(inspectCommands[0]);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  const copyJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('JSON data copied to clipboard!');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🆔</span>
            Container Identity
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                {sampleInspectData.Id.slice(0, 12)}...
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 font-mono">{sampleInspectData.Name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Image:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                nginx:latest
              </code>
            </div>
          </div>
        </div>

        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">📊</span>
            Current State
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {sampleInspectData.State.Status}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">PID:</span>
              <span className="ml-2 font-mono">{sampleInspectData.State.Pid}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Started:</span>
              <span className="ml-2 text-xs">
                {new Date(sampleInspectData.State.StartedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      <div className="container-surface p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-primary">⚙️</span>
          Environment Variables
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sampleInspectData.Config.Env.map((env, index) => (
            <code key={index} className="block text-xs bg-secondary/50 px-2 py-1 rounded">
              {env}
            </code>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🏠</span>
            Container Details
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Hostname:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                {sampleInspectData.Config.Hostname}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Working Directory:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                {sampleInspectData.Config.WorkingDir || '/'}
              </code>
            </div>
          </div>
        </div>

        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🚀</span>
            Command & Args
          </h4>
          <div className="space-y-2">
            {sampleInspectData.Config.Cmd.map((cmd, index) => (
              <code key={index} className="block text-xs bg-secondary/50 px-2 py-1 rounded">
                {cmd}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNetwork = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🌐</span>
            IP Configuration
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">IP Address:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                {sampleInspectData.NetworkSettings.IPAddress}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Gateway:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                172.17.0.1
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">MAC Address:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                02:42:ac:11:00:02
              </code>
            </div>
          </div>
        </div>

        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🔌</span>
            Port Mapping
          </h4>
          <div className="space-y-2">
            {Object.entries(sampleInspectData.NetworkSettings.Ports).map(([containerPort, hostPorts]) => (
              <div key={containerPort} className="text-sm">
                <span className="text-muted-foreground">Container:</span>
                <code className="mx-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                  {containerPort}
                </code>
                <span className="text-muted-foreground">→ Host:</span>
                <code className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  {(hostPorts as any)[0]?.HostPort || 'Not mapped'}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-surface p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-primary">🔗</span>
          Network Connections
        </h4>
        <div className="space-y-3">
          {Object.entries(sampleInspectData.NetworkSettings.Networks).map(([networkName, networkInfo]) => (
            <div key={networkName} className="bg-secondary/30 p-4 rounded-lg">
              <h5 className="font-medium mb-2">{networkName}</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">IP:</span>
                  <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                    {(networkInfo as any).IPAddress}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Gateway:</span>
                  <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                    {(networkInfo as any).Gateway}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Prefix:</span>
                  <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                    /{(networkInfo as any).IPPrefixLen}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStorage = () => (
    <div className="space-y-6">
      <div className="container-surface p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-primary">💾</span>
          Volume Mounts
        </h4>
        <div className="space-y-4">
          {sampleInspectData.Mounts.map((mount, index) => (
            <div key={index} className="bg-secondary/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  mount.Type === 'volume' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {mount.Type}
                </span>
                <span className={`text-xs ${mount.RW ? 'text-green-400' : 'text-red-400'}`}>
                  {mount.RW ? 'Read/Write' : 'Read Only'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                    {mount.Source}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Destination:</span>
                  <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                    {mount.Destination}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🔧</span>
            Resource Limits
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Memory Limit:</span>
              <span className="ml-2 font-mono">
                {sampleInspectData.HostConfig.Memory 
                  ? `${(sampleInspectData.HostConfig.Memory / 1024 / 1024).toFixed(0)}MB` 
                  : 'Unlimited'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">CPU Shares:</span>
              <span className="ml-2 font-mono">{sampleInspectData.HostConfig.CpuShares}</span>
            </div>
          </div>
        </div>

        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🔄</span>
            Restart Policy
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Policy:</span>
              <code className="ml-2 bg-secondary/50 px-2 py-1 rounded text-xs">
                {sampleInspectData.HostConfig.RestartPolicy.Name}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Max Retries:</span>
              <span className="ml-2 font-mono">
                {sampleInspectData.HostConfig.RestartPolicy.MaximumRetryCount || 'Unlimited'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'config': return renderConfig();
      case 'network': return renderNetwork();
      case 'storage': return renderStorage();
      case 'resources': return renderResources();
      default: return renderOverview();
    }
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
          Docker <span className="text-gradient">Inspect</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Deep dive into container internals with Docker inspect. Analyze configuration, networking, 
          storage, and resource allocation for comprehensive container debugging and monitoring.
        </p>
      </motion.div>

      {/* Command Examples */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h3 className="text-xl font-semibold mb-6 text-center">Common Inspect Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspectCommands.map((cmd, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="container-surface p-4 group hover:container-active transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCommand(cmd)}
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-1 rounded">
                  {cmd.command}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyCommand(cmd.command);
                  }}
                  className="p-1 hover:bg-primary/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{cmd.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section Navigation */}
      <div className="flex justify-center mb-8">
        <div className="container-surface p-1 rounded-lg flex flex-wrap gap-1">
          {inspectSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary/50'
              }`}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Section Description */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          {inspectSections.find(s => s.id === activeSection)?.description}
        </p>
      </div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderSection()}
      </motion.div>

      {/* JSON Export */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 container-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <span className="text-primary">📄</span>
            Raw JSON Output
          </h4>
          <button
            onClick={() => copyJson(sampleInspectData)}
            className="flex items-center gap-2 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy JSON
          </button>
        </div>
        
        <div className="terminal">
          <div className="terminal-content max-h-60 overflow-y-auto">
            <pre className="text-xs">
              <code>{JSON.stringify(sampleInspectData, null, 2)}</code>
            </pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DockerInspect;