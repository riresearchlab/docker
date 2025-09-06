import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, FileText, Search, Filter, Copy, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  container: string;
}

interface LogCommand {
  command: string;
  description: string;
  output: LogEntry[];
  category: 'basic' | 'filter' | 'format' | 'follow';
}

const logCommands: LogCommand[] = [
  {
    command: 'docker logs nginx-container',
    description: 'View all logs from a specific container',
    category: 'basic',
    output: [
      { timestamp: '2024-01-15T10:30:15.123Z', level: 'info', message: 'nginx/1.21.6', container: 'nginx-container' },
      { timestamp: '2024-01-15T10:30:15.124Z', level: 'info', message: 'OS: Linux 5.15.0-56-generic', container: 'nginx-container' },
      { timestamp: '2024-01-15T10:30:15.125Z', level: 'info', message: 'built by gcc 9.4.0 (Ubuntu 9.4.0-1ubuntu1~20.04.1)', container: 'nginx-container' },
      { timestamp: '2024-01-15T10:30:15.126Z', level: 'info', message: 'start worker processes', container: 'nginx-container' },
      { timestamp: '2024-01-15T10:30:15.127Z', level: 'info', message: 'start worker process 29', container: 'nginx-container' },
      { timestamp: '2024-01-15T10:31:20.456Z', level: 'info', message: '192.168.1.100 - - [15/Jan/2024:10:31:20 +0000] "GET / HTTP/1.1" 200 612', container: 'nginx-container' },
      { timestamp: '2024-01-15T10:32:15.789Z', level: 'info', message: '192.168.1.101 - - [15/Jan/2024:10:32:15 +0000] "GET /api/health HTTP/1.1" 200 2', container: 'nginx-container' }
    ]
  },
  {
    command: 'docker logs --tail 50 web-app',
    description: 'Show only the last 50 log entries',
    category: 'filter',
    output: [
      { timestamp: '2024-01-15T10:28:45.123Z', level: 'info', message: 'Server starting on port 3000', container: 'web-app' },
      { timestamp: '2024-01-15T10:28:45.456Z', level: 'info', message: 'Database connection established', container: 'web-app' },
      { timestamp: '2024-01-15T10:29:30.789Z', level: 'warning', message: 'High memory usage detected: 85%', container: 'web-app' },
      { timestamp: '2024-01-15T10:30:15.012Z', level: 'info', message: 'User login: john@example.com', container: 'web-app' },
      { timestamp: '2024-01-15T10:30:45.345Z', level: 'error', message: 'Failed to connect to external API: timeout', container: 'web-app' },
      { timestamp: '2024-01-15T10:31:00.678Z', level: 'info', message: 'API request processed successfully', container: 'web-app' }
    ]
  },
  {
    command: 'docker logs --since "2024-01-15T10:30:00" database',
    description: 'Show logs since a specific timestamp',
    category: 'filter',
    output: [
      { timestamp: '2024-01-15T10:30:05.123Z', level: 'info', message: 'PostgreSQL Database system is ready to accept connections', container: 'database' },
      { timestamp: '2024-01-15T10:30:15.456Z', level: 'info', message: 'Connection from 172.17.0.3:45678', container: 'database' },
      { timestamp: '2024-01-15T10:30:30.789Z', level: 'debug', message: 'Query: SELECT * FROM users WHERE id = 1', container: 'database' },
      { timestamp: '2024-01-15T10:31:00.012Z', level: 'warning', message: 'Slow query detected: 2.5s execution time', container: 'database' },
      { timestamp: '2024-01-15T10:31:15.345Z', level: 'info', message: 'Checkpoint starting: immediate', container: 'database' }
    ]
  },
  {
    command: 'docker logs -f --timestamps redis-cache',
    description: 'Follow logs in real-time with timestamps',
    category: 'follow',
    output: [
      { timestamp: '2024-01-15T10:30:00.123Z', level: 'info', message: 'Redis server started on port 6379', container: 'redis-cache' },
      { timestamp: '2024-01-15T10:30:15.456Z', level: 'info', message: 'Ready to accept connections', container: 'redis-cache' },
      { timestamp: '2024-01-15T10:30:30.789Z', level: 'info', message: 'Client connected: id=2 addr=172.17.0.2:54321', container: 'redis-cache' },
      { timestamp: '2024-01-15T10:31:00.012Z', level: 'debug', message: 'GET user:session:abc123', container: 'redis-cache' },
      { timestamp: '2024-01-15T10:31:15.345Z', level: 'info', message: 'Background saving started by pid 42', container: 'redis-cache' }
    ]
  },
  {
    command: 'docker logs --details app-server',
    description: 'Show logs with extra details like labels and environment',
    category: 'format',
    output: [
      { timestamp: '2024-01-15T10:30:00.123Z', level: 'info', message: '[env=production] [version=1.2.3] Application starting...', container: 'app-server' },
      { timestamp: '2024-01-15T10:30:05.456Z', level: 'info', message: '[service=api] [port=8080] HTTP server listening', container: 'app-server' },
      { timestamp: '2024-01-15T10:30:15.789Z', level: 'info', message: '[middleware=auth] JWT validation enabled', container: 'app-server' },
      { timestamp: '2024-01-15T10:30:30.012Z', level: 'warning', message: '[health-check] Database response time: 1.2s', container: 'app-server' },
      { timestamp: '2024-01-15T10:31:00.345Z', level: 'error', message: '[api=/users] Request validation failed: missing email', container: 'app-server' }
    ]
  }
];

const LogViewer = ({ logs, isFollowing }: { logs: LogEntry[], isFollowing: boolean }) => {
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = logs;
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  }, [logs, levelFilter, searchTerm]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'info': return 'bg-blue-500/20';
      case 'debug': return 'bg-gray-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-dot bg-red-500"></div>
        <div className="terminal-dot bg-yellow-500"></div>
        <div className="terminal-dot bg-green-500"></div>
        <span className="text-sm text-muted-foreground ml-4">Docker Logs</span>
        
        {isFollowing && (
          <div className="ml-auto flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-green-500 rounded-full"
            ></motion.div>
            <span className="text-xs text-green-400">Following</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-muted flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm border-none outline-none placeholder-muted-foreground"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-transparent text-sm border-none outline-none"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>
      
      <div className="terminal-content max-h-80 overflow-y-auto">
        <AnimatePresence>
          {filteredLogs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-3 py-1 hover:bg-primary/5 transition-colors"
            >
              <span className="text-xs text-muted-foreground font-mono min-w-[140px]">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono min-w-[60px] text-center ${getLevelColor(log.level)} ${getLevelBg(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-sm font-mono flex-1">
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No logs match your filter criteria
          </div>
        )}
      </div>
    </div>
  );
};

const DockerLogs = () => {
  const [selectedCommand, setSelectedCommand] = useState<LogCommand>(logCommands[0]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Commands' },
    { id: 'basic', label: 'Basic Logs' },
    { id: 'filter', label: 'Filtering' },
    { id: 'format', label: 'Formatting' },
    { id: 'follow', label: 'Real-time' }
  ];

  const filteredCommands = selectedCategory === 'all' 
    ? logCommands 
    : logCommands.filter(cmd => cmd.category === selectedCategory);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  const executeCommand = (cmd: LogCommand) => {
    setSelectedCommand(cmd);
    setIsFollowing(cmd.category === 'follow');
    toast.success('Command executed!');
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
          Docker <span className="text-gradient">Logs</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Master container debugging with Docker's powerful logging system. View, filter, and analyze 
          application output to troubleshoot issues and monitor container behavior.
        </p>
      </motion.div>

      {/* Log Types */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          { name: 'Info', icon: '📘', color: 'text-blue-400', desc: 'Normal application events' },
          { name: 'Warning', icon: '⚠️', color: 'text-yellow-400', desc: 'Potential issues to monitor' },
          { name: 'Error', icon: '🚨', color: 'text-red-400', desc: 'Application failures and exceptions' },
          { name: 'Debug', icon: '🐛', color: 'text-gray-400', desc: 'Detailed troubleshooting information' }
        ].map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="container-surface p-6 text-center group hover:container-active transition-all duration-300"
          >
            <div className="text-4xl mb-3">{type.icon}</div>
            <h3 className={`font-semibold text-lg mb-2 ${type.color}`}>{type.name}</h3>
            <p className="text-sm text-muted-foreground">{type.desc}</p>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Command List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Logging Commands
          </h3>
          
          {filteredCommands.map((cmd, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`container-surface p-4 cursor-pointer transition-all duration-300 ${
                selectedCommand.command === cmd.command ? 'container-active' : 'hover:bg-secondary/50'
              }`}
              onClick={() => executeCommand(cmd)}
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
                  <button className="p-1 hover:bg-primary/10 rounded transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{cmd.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Log Viewer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Live Log Output
            </h3>
            
            {isFollowing && (
              <button
                onClick={() => setIsFollowing(false)}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Stop Following
              </button>
            )}
          </div>
          
          <LogViewer logs={selectedCommand.output} isFollowing={isFollowing} />
        </div>
      </div>

      {/* Log Management Tips */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">💡</span>
            Log Management Best Practices
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use structured logging (JSON format)</li>
            <li>• Implement log rotation to manage disk space</li>
            <li>• Set appropriate log levels for different environments</li>
            <li>• Use centralized logging for multi-container apps</li>
            <li>• Monitor log volume and performance impact</li>
            <li>• Include correlation IDs for request tracing</li>
          </ul>
        </div>

        <div className="container-surface p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">🔧</span>
            Advanced Log Commands
          </h4>
          <div className="space-y-3">
            <div>
              <code className="text-xs bg-terminal-bg text-terminal-text px-2 py-1 rounded block mb-1">
                docker logs --since 1h container-name
              </code>
              <p className="text-xs text-muted-foreground">Logs from the last hour</p>
            </div>
            <div>
              <code className="text-xs bg-terminal-bg text-terminal-text px-2 py-1 rounded block mb-1">
                docker logs --until "2024-01-15T10:30:00" app
              </code>
              <p className="text-xs text-muted-foreground">Logs until specific time</p>
            </div>
            <div>
              <code className="text-xs bg-terminal-bg text-terminal-text px-2 py-1 rounded block mb-1">
                docker logs 2&gt;&amp;1 | grep ERROR
              </code>
              <p className="text-xs text-muted-foreground">Filter error messages</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DockerLogs;