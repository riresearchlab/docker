import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import DockerScene from '../components/DockerScene';
import Terminal from '../components/Terminal';
import EnhancedImageGallery from '../components/EnhancedImageGallery';
import DockerCompose from '../components/DockerCompose';
import DockerNetworks from '../components/DockerNetworks';
import DockerVolumes from '../components/DockerVolumes';
import DockerLogs from '../components/DockerLogs';
import DockerInspect from '../components/DockerInspect';
import DockerfileSection from '../components/DockerfileSection';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarNavigation, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarTrigger,
  SidebarSeparator
} from '../components/ui/sidebar';

const dockerCommands = [
  {
    command: 'docker ps',
    output: [
      'CONTAINER ID   IMAGE      COMMAND                  CREATED          STATUS          PORTS                    NAMES',
      '7f9c8d5a1b3e   nginx      "/docker-entrypoint.…"   2 minutes ago    Up 2 minutes    0.0.0.0:80->80/tcp      web-server',
      '3a1e9b2c4d6f   postgres   "docker-entrypoint.s…"   5 minutes ago    Up 5 minutes    0.0.0.0:5432->5432/tcp  database',
      '9e2f1a3c7b8d   redis      "docker-entrypoint.s…"   10 minutes ago   Up 10 minutes   0.0.0.0:6379->6379/tcp  cache',
      '5b7d2e9f4a1c   mongodb    "docker-entrypoint.s…"   15 minutes ago   Up 15 minutes   0.0.0.0:27017->27017/tcp mongo-db',
      '8c1f6e4b9a2d   mysql      "docker-entrypoint.s…"   20 minutes ago   Up 20 minutes   0.0.0.0:3306->3306/tcp  mysql-server'
    ],
    description: 'List all running containers with their status and details'
  },
  {
    command: 'docker run -d -p 80:80 nginx',
    output: [
      'Unable to find image \'nginx:latest\' locally',
      'latest: Pulling from library/nginx',
      'e2f2ac8d5a8a: Pull complete',
      '3f5b5e2c1a9b: Pull complete',
      'Status: Downloaded newer image for nginx:latest',
      '7f9c8d5a1b3e8a9c2d5f6e8b1a4c7e9f'
    ],
    description: 'Pull and run an nginx container in detached mode, mapping port 80'
  },
  {
    command: 'docker images',
    output: [
      'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE',
      'nginx        latest    2ac49d2a5a73   2 weeks ago    142MB',
      'postgres     13        3f5b5e2c1a9b   3 weeks ago    371MB',
      'node         18        1a2b3c4d5e6f   1 month ago    993MB',
      'redis        alpine    8e3c7d2f9a1b   1 month ago    32.2MB',
      'mongodb      latest    5d7e9f2a8c4b   2 months ago   695MB'
    ],
    description: 'List all locally stored Docker images'
  },
  {
    command: 'docker exec -it web-server bash',
    output: [
      'root@7f9c8d5a1b3e:/# ls',
      'bin   dev  home  lib64  mnt  proc  run   srv  tmp  var',
      'boot  etc  lib   media  opt  root  sbin  sys  usr',
      'root@7f9c8d5a1b3e:/# '
    ],
    description: 'Execute an interactive bash session inside a running container'
  },
  {
    command: 'docker build -t myapp .',
    output: [
      'Sending build context to Docker daemon  2.048kB',
      'Step 1/5 : FROM node:18',
      'Step 2/5 : WORKDIR /app',
      'Step 3/5 : COPY package*.json ./',
      'Step 4/5 : RUN npm install',
      'Step 5/5 : CMD ["npm", "start"]',
      'Successfully built 9f8e7d6c5b4a',
      'Successfully tagged myapp:latest'
    ],
    description: 'Build a Docker image from a Dockerfile in the current directory'
  },
  {
    command: 'docker logs web-server',
    output: [
      '2024-01-15 10:30:15 [notice] 1#1: nginx/1.21.6',
      '2024-01-15 10:30:15 [notice] 1#1: OS: Linux 5.15.0',
      '2024-01-15 10:30:15 [notice] 1#1: start worker processes',
      '2024-01-15 10:30:15 [notice] 1#1: start worker process 29',
      '2024-01-15 10:31:20 192.168.1.100 - - [15/Jan/2024:10:31:20 +0000] "GET / HTTP/1.1" 200 612'
    ],
    description: 'View the logs from a specific container'
  },
  {
    command: 'docker rm web-server',
    output: [
      'Error response from daemon: You cannot remove a running container 7f9c8d5a1b3e. Stop the container before attempting removal or force remove',
    ],
    description: 'Remove a container (must be stopped first)'
  },
  {
    command: 'docker rm -f web-server database',
    output: [
      'web-server',
      'database'
    ],
    description: 'Force remove multiple containers (running or stopped)'
  },
  {
    command: 'docker rmi nginx:latest',
    output: [
      'Error response from daemon: conflict: unable to remove repository reference "nginx:latest" (must force) - container 7f9c8d5a1b3e is using its referenced image 2ac49d2a5a73'
    ],
    description: 'Remove a Docker image (fails if containers are using it)'
  },
  {
    command: 'docker rmi -f nginx:latest postgres:13',
    output: [
      'Untagged: nginx:latest',
      'Untagged: nginx@sha256:2ac49d2a5a73...',
      'Deleted: sha256:2ac49d2a5a73...',
      'Deleted: sha256:e2f2ac8d5a8a...',
      'Untagged: postgres:13',
      'Untagged: postgres@sha256:3f5b5e2c1a9b...',
      'Deleted: sha256:3f5b5e2c1a9b...'
    ],
    description: 'Force remove multiple Docker images'
  }
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <SidebarProvider activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="min-h-screen bg-background flex">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center px-2 py-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-primary">
                <Container className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <SidebarSeparator />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNavigation />
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator />
            <div className="text-xs text-muted-foreground text-center p-2 opacity-70 hover:opacity-100 transition-opacity duration-300">
              Master containerization. Build the future.
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-lg border-b border-border">
            <SidebarTrigger />
            <div className="text-lg font-bold">Docker Academy</div>
          </div>
      
      {/* Hero Section */}
      <section id="intro" className="hero-gradient min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                From Monolithic to{' '}
                <span className="text-gradient">Microservices</span>
                <br />
                The Docker Way
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Master containerization with Docker. Learn to build, ship, and run applications 
                anywhere with the power of lightweight, portable containers.
              </p>
              
            </motion.div>
          </div>
          
          {/* Concept Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <div className="container-surface p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Container className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightweight</h3>
              <p className="text-muted-foreground">
                Containers share the host OS kernel, making them more efficient than traditional VMs
              </p>
            </div>
            
            <div className="container-surface p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Portable</h3>
              <p className="text-muted-foreground">
                Run the same container on your laptop, staging, and production environments
              </p>
            </div>
            
            <div className="container-surface p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Scalable</h3>
              <p className="text-muted-foreground">
                Easily scale your applications up or down based on demand
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Docker CLI Section */}
      <section id="cli" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Docker <span className="text-gradient">CLI</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Master the command line interface that powers Docker. Click any command to see it in action.
            </p>
          </motion.div>
          
          <Terminal commands={dockerCommands} />
        </div>
      </section>

      {/* Popular Images Section */}
      <section id="images" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <EnhancedImageGallery />
        </div>
      </section>

      {/* Docker Networks Section */}
      <section id="networks" className="py-20">
        <div className="container mx-auto px-6">
          <DockerNetworks />
        </div>
      </section>

      {/* Docker Volumes Section */}
      <section id="volumes" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <DockerVolumes />
        </div>
      </section>

      {/* Docker Logs Section */}
      <section id="logs" className="py-20">
        <div className="container mx-auto px-6">
          <DockerLogs />
        </div>
      </section>

      {/* Docker Inspect Section */}
      <section id="inspect" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <DockerInspect />
        </div>
      </section>

      {/* Dockerfile Section */}
      <section id="dockerfile" className="py-20">
        <div className="container mx-auto px-6">
          <DockerfileSection />
        </div>
      </section>

      {/* Docker Compose Section */}
      <section id="compose" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <DockerCompose />
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Continue Your <span className="text-gradient">Journey</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to dive deeper? Here are the best resources to advance your Docker skills.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Official Docker Docs',
                description: 'Comprehensive documentation from Docker Inc.',
                url: 'https://docs.docker.com',
                icon: '📚'
              },
              {
                title: 'Docker Hub',
                description: 'Browse and discover container images',
                url: 'https://hub.docker.com',
                icon: '🐳'
              },
              {
                title: 'Docker Compose',
                description: 'Multi-container application orchestration',
                url: 'https://docs.docker.com/compose',
                icon: '🔧'
              },
              {
                title: 'Kubernetes',
                description: 'Container orchestration at scale',
                url: 'https://kubernetes.io',
                icon: '☸️'
              },
              {
                title: 'Best Practices',
                description: 'Production-ready Docker patterns',
                url: 'https://docs.docker.com/develop/best-practices',
                icon: '⭐'
              },
              {
                title: 'Security Guide',
                description: 'Secure your containers and images',
                url: 'https://docs.docker.com/engine/security',
                icon: '🔒'
              }
            ].map((resource, index) => (
              <motion.a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="container-surface p-6 group hover:container-active transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{resource.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {resource.title}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Container className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Master containerization. Build the future.
          </p>
        </div>
      </footer>
          </div>
        </div>
      </SidebarProvider>
    );
};

export default Index;