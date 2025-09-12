import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, Terminal as TerminalIcon } from 'lucide-react';
import { toast } from 'sonner';

interface TerminalProps {
  commands: Array<{
    command: string;
    output: string[];
    description: string;
  }>;
}

const Terminal = ({ commands }: TerminalProps) => {
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<Array<{command: string, output: string[]}>>([]);

  const executeCommand = async (commandIndex: number) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setSelectedCommand(commandIndex);
    
    const command = commands[commandIndex];
    
    // Add command to history
    setCommandHistory(prev => [...prev, { command: command.command, output: [] }]);
    
    // Simulate typing the command
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add output lines with delay
    const newOutput: string[] = [];
    for (let i = 0; i < command.output.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      newOutput.push(command.output[i]);
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
    setOutputLines([]);
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Command List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-primary" />
          Docker Commands
        </h3>
        
        {commands.map((cmd, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`container-surface p-4 transition-all duration-300 ${
              selectedCommand === index ? 'container-active' : 'hover:bg-secondary/50'
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
                    executeCommand(index);
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
          <span className="text-sm text-muted-foreground ml-4">Docker Terminal</span>
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
  );
};

export default Terminal;