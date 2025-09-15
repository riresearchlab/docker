import { useState } from 'react';
import { motion } from 'framer-motion';
import { File, Code, Layers, CheckCircle, XCircle, GitBranch, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DockerfileKeyword {
  keyword: string;
  description: string;
  example: string;
}

interface DockerfileExample {
  title: string;
  description: string;
  code: string;
  explanation: string[];
}

interface DockerfileBestPractice {
  title: string;
  description: string;
  goodExample?: string;
  badExample?: string;
}

interface DockerfilePattern {
  title: string;
  description: string;
  isAntiPattern: boolean;
  example: string;
}

const DockerfileSection = () => {
  const [selectedExample, setSelectedExample] = useState(0);

  const keywords: DockerfileKeyword[] = [
    {
      keyword: 'FROM',
      description: 'Specifies the base image to start building from. This is typically the first instruction in a Dockerfile.',
      example: 'FROM node:18-alpine'
    },
    {
      keyword: 'RUN',
      description: 'Executes commands in a new layer on top of the current image and commits the results.',
      example: 'RUN npm install && npm cache clean --force'
    },
    {
      keyword: 'COPY',
      description: 'Copies files or directories from the host machine to the container filesystem.',
      example: 'COPY package.json /app/'
    },
    {
      keyword: 'ADD',
      description: 'Similar to COPY but with additional features like extracting tar files and downloading from URLs.',
      example: 'ADD https://example.com/file.tar.gz /app/'
    },
    {
      keyword: 'WORKDIR',
      description: 'Sets the working directory for any subsequent RUN, CMD, ENTRYPOINT, COPY, and ADD instructions.',
      example: 'WORKDIR /app'
    },
    {
      keyword: 'ENV',
      description: 'Sets environment variables that will be available during build and in the running container.',
      example: 'ENV NODE_ENV=production'
    },
    {
      keyword: 'ARG',
      description: 'Defines variables that users can pass at build-time using --build-arg. Unlike ENV, ARG values are not available in the running container.',
      example: 'ARG VERSION=latest'
    },
    {
      keyword: 'EXPOSE',
      description: 'Informs Docker that the container listens on the specified network ports at runtime.',
      example: 'EXPOSE 3000'
    },
    {
      keyword: 'VOLUME',
      description: 'Creates a mount point with the specified name and marks it as holding externally mounted volumes.',
      example: 'VOLUME ["/data"]'
    },
    {
      keyword: 'CMD',
      description: 'Provides default commands and arguments for an executing container. Can be overridden at runtime.',
      example: 'CMD ["node", "server.js"]'
    },
    {
      keyword: 'ENTRYPOINT',
      description: 'Configures a container to run as an executable. Often used with CMD to set default arguments.',
      example: 'ENTRYPOINT ["node"]'
    },
    {
      keyword: 'HEALTHCHECK',
      description: 'Tells Docker how to test a container to check if it\'s still working.',
      example: 'HEALTHCHECK --interval=5m CMD curl -f http://localhost/ || exit 1'
    },
    {
      keyword: 'USER',
      description: 'Sets the user name or UID to use when running the image.',
      example: 'USER node'
    },
    {
      keyword: 'LABEL',
      description: 'Adds metadata to an image as key-value pairs.',
      example: 'LABEL version="1.0" maintainer="example@example.com"'
    },
    {
      keyword: 'SHELL',
      description: 'Overrides the default shell used for the shell form of commands.',
      example: 'SHELL ["/bin/bash", "-c"]'
    }
  ];

  const examples: DockerfileExample[] = [
    {
      title: 'Simple Node.js Application',
      description: 'A basic Dockerfile for a Node.js web application',
      code: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
`,
      explanation: [
        'Starts from the official Node.js Alpine image (lightweight)',
        'Sets the working directory to /app',
        'Copies package.json and package-lock.json first (for better caching)',
        'Installs dependencies',
        'Copies the rest of the application code',
        'Exposes port 3000 for the application',
        'Specifies the command to run the application'
      ]
    },
    {
      title: 'Python Flask Application',
      description: 'Dockerfile for a Python Flask web service',
      code: `FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

CMD ["flask", "run"]
`,
      explanation: [
        'Uses the official Python slim image',
        'Sets the working directory to /app',
        'Copies and installs Python dependencies first (for better caching)',
        'Copies the application code',
        'Exposes port 5000 for the Flask application',
        'Sets environment variables for Flask',
        'Runs the Flask application'
      ]
    },
    {
      title: 'Multi-stage Java Build',
      description: 'A multi-stage Dockerfile for a Java Spring Boot application',
      code: `# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
`,
      explanation: [
        'Uses a multi-stage build to keep the final image small',
        'First stage uses Maven to build the application',
        'Second stage uses a slim JDK image',
        'Copies only the built JAR file from the build stage',
        'Exposes port 8080 for the Spring Boot application',
        'Sets the entrypoint to run the JAR file'
      ]
    },
    {
      title: 'Go Application with Alpine',
      description: 'A minimal Dockerfile for a Go application using Alpine',
      code: `FROM golang:1.18-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /go/bin/app

FROM alpine:3.15

COPY --from=build /go/bin/app /app

EXPOSE 8080

CMD ["/app"]
`,
      explanation: [
        'Uses a multi-stage build for a minimal final image',
        'First stage compiles the Go application',
        'Uses CGO_ENABLED=0 for a static binary',
        'Second stage uses a minimal Alpine image',
        'Copies only the compiled binary from the build stage',
        'Results in a very small container image'
      ]
    },
    {
      title: 'React Application with Nginx',
      description: 'Dockerfile for building and serving a React application with Nginx',
      code: `# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
      explanation: [
        'Uses a multi-stage build process',
        'First stage builds the React application',
        'Second stage uses Nginx to serve the static files',
        'Copies only the built files from the build stage',
        'Configures Nginx with a custom configuration',
        'Exposes port 80 for web traffic'
      ]
    }
  ];

  const bestPractices: DockerfileBestPractice[] = [
    {
      title: 'Use specific image versions',
      description: 'Always use specific image versions instead of latest to ensure reproducible builds.',
      goodExample: 'FROM node:18.12.1-alpine3.16',
      badExample: 'FROM node:latest'
    },
    {
      title: 'Minimize layers',
      description: 'Combine RUN commands with && to reduce the number of layers and image size.',
      goodExample: 'RUN apt-get update && apt-get install -y package1 package2 && rm -rf /var/lib/apt/lists/*',
      badExample: 'RUN apt-get update\nRUN apt-get install -y package1\nRUN apt-get install -y package2'
    },
    {
      title: 'Use .dockerignore',
      description: 'Create a .dockerignore file to exclude files not needed in the build context.',
      goodExample: '# .dockerignore\nnode_modules\nnpm-debug.log\n.git\n.env'
    },
    {
      title: 'Order instructions by change frequency',
      description: 'Place instructions that change less frequently at the top to leverage build cache.',
      goodExample: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .'
    },
    {
      title: 'Use multi-stage builds',
      description: 'Use multi-stage builds to create smaller production images.',
      goodExample: '# Build stage\nFROM node:18 AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\n# Production stage\nFROM node:18-alpine\nCOPY --from=build /app/dist /app\nCMD ["node", "/app/server.js"]'
    },
    {
      title: 'Run as non-root user',
      description: 'Create and use a non-root user for security reasons.',
      goodExample: 'RUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser'
    },
    {
      title: 'Clean up in the same layer',
      description: 'Clean up temporary files in the same RUN instruction to avoid adding them to the layer.',
      goodExample: 'RUN apt-get update && apt-get install -y package && rm -rf /var/lib/apt/lists/*',
      badExample: 'RUN apt-get update && apt-get install -y package\nRUN rm -rf /var/lib/apt/lists/*'
    },
    {
      title: 'Use COPY instead of ADD',
      description: 'Use COPY for simple file copying as it\'s more transparent than ADD.',
      goodExample: 'COPY ./app /app',
      badExample: 'ADD ./app /app'
    }
  ];

  const patterns: DockerfilePattern[] = [
    {
      title: 'Builder Pattern',
      description: 'Use separate containers for building and running applications.',
      isAntiPattern: false,
      example: '# Build stage\nFROM node:18 AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\n# Run stage\nFROM node:18-alpine\nCOPY --from=builder /app/dist /app\nCMD ["node", "/app/index.js"]'
    },
    {
      title: 'Sidecar Pattern',
      description: 'Run multiple processes in a container by using a simple init system.',
      isAntiPattern: false,
      example: 'FROM alpine:3.14\nRUN apk add --no-cache tini\nCOPY entrypoint.sh /\nRUN chmod +x /entrypoint.sh\nENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]'
    },
    {
      title: 'Installing unnecessary packages',
      description: 'Installing packages that are not needed in the final image.',
      isAntiPattern: true,
      example: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y build-essential python3 vim git curl wget'
    },
    {
      title: 'Using a single layer for everything',
      description: 'Putting all commands in a single RUN instruction, making the build process inefficient.',
      isAntiPattern: true,
      example: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y nodejs && mkdir -p /app && git clone https://github.com/myapp.git /app && cd /app && npm install && npm run build'
    },
    {
      title: 'Not removing build dependencies',
      description: 'Keeping build dependencies in the final image, increasing its size unnecessarily.',
      isAntiPattern: true,
      example: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y build-essential python3-dev && pip install mypackage'
    },
    {
      title: 'Using latest tag',
      description: 'Using the latest tag for base images, making builds non-reproducible.',
      isAntiPattern: true,
      example: 'FROM node:latest\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["npm", "start"]'
    }
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Understanding <span className="text-gradient">Dockerfiles</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn how to create efficient Dockerfiles to build your container images.
        </p>
      </motion.div>

      {/* Dockerfile Concepts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <div className="container-surface p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Key Dockerfile Concepts</h3>
          </div>

          <p className="mb-6 text-muted-foreground">
            A Dockerfile is a text document containing instructions to build a Docker image. Each instruction creates a layer in the image.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {keywords.slice(0, 6).map((keyword, index) => (
              <div key={index} className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-primary mb-2">{keyword.keyword}</h4>
                <p className="text-sm text-muted-foreground mb-2">{keyword.description}</p>
                <div className="bg-background/50 p-2 rounded text-xs font-mono">
                  {keyword.example}
                </div>
              </div>
            ))}
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more-keywords">
              <AccordionTrigger className="text-primary hover:no-underline">
                View more Dockerfile instructions
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {keywords.slice(6).map((keyword, index) => (
                    <div key={index} className="bg-secondary/20 p-4 rounded-lg">
                      <h4 className="text-md font-semibold text-primary mb-2">{keyword.keyword}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{keyword.description}</p>
                      <div className="bg-background/50 p-2 rounded text-xs font-mono">
                        {keyword.example}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.div>

      {/* Dockerfile Examples Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <div className="container-surface p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Practical Dockerfile Examples</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedExample(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${selectedExample === index ? 'bg-primary text-primary-foreground' : 'bg-secondary/20 hover:bg-secondary/40'}`}
                  >
                    <div className="font-medium">{example.title}</div>
                    <div className={`text-xs ${selectedExample === index ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {example.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 bg-secondary/20 rounded-lg overflow-hidden">
              <div className="bg-secondary/40 p-3 font-medium">
                {examples[selectedExample].title}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                <div className="md:col-span-2 p-4 font-mono text-sm overflow-auto" style={{ maxHeight: '400px' }}>
                  <pre className="whitespace-pre">{examples[selectedExample].code}</pre>
                </div>
                <div className="bg-background/50 p-4 border-l border-border">
                  <h4 className="font-medium mb-3">Explanation</h4>
                  <ul className="space-y-2 text-sm">
                    {examples[selectedExample].explanation.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                        </div>
                        <div className="text-muted-foreground">{item}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visual Diagrams Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <div className="container-surface p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Dockerfile Concepts Visualized</h3>
          </div>

          <Tabs defaultValue="layers">
            <TabsList className="mb-6">
              <TabsTrigger value="layers">Image Layers</TabsTrigger>
              <TabsTrigger value="build">Build Process</TabsTrigger>
              <TabsTrigger value="multistage">Multi-stage Builds</TabsTrigger>
            </TabsList>

            <TabsContent value="layers" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4">How Docker Image Layers Work</h4>
                  <p className="text-muted-foreground mb-4">
                    Docker images are built in layers. Each instruction in a Dockerfile creates a new layer. Layers are cached and reused, making builds faster.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div className="text-muted-foreground">Each layer is a difference from the previous layer</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div className="text-muted-foreground">Layers are read-only once built</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div className="text-muted-foreground">When a container runs, a writable layer is added on top</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div className="text-muted-foreground">Layers can be shared between images, saving disk space</div>
                    </li>
                  </ul>
                </div>

                <div className="bg-secondary/20 p-6 rounded-lg">
                  <div className="relative h-80">
                    {/* Base Image Layer */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium">Base Image (FROM)</div>
                    </div>
                    
                    {/* RUN Layer */}
                    <div className="absolute bottom-16 left-4 right-4 h-14 bg-green-500/20 border border-green-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium">RUN apt-get update && install</div>
                    </div>
                    
                    {/* COPY Layer */}
                    <div className="absolute bottom-30 left-8 right-8 h-12 bg-purple-500/20 border border-purple-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium">COPY app files</div>
                    </div>
                    
                    {/* WORKDIR Layer */}
                    <div className="absolute bottom-42 left-12 right-12 h-10 bg-yellow-500/20 border border-yellow-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium">WORKDIR /app</div>
                    </div>
                    
                    {/* CMD Layer */}
                    <div className="absolute bottom-52 left-16 right-16 h-10 bg-red-500/20 border border-red-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium">CMD ["npm", "start"]</div>
                    </div>
                    
                    {/* Container Layer */}
                    <div className="absolute bottom-62 left-20 right-20 h-10 bg-primary/20 border border-primary/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium">Container (Writable Layer)</div>
                    </div>

                    {/* Connecting Lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-muted-foreground" />
                          </marker>
                        </defs>
                        <line x1="50%" y1="15%" x2="50%" y2="95%" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-muted-foreground" markerEnd="url(#arrowhead)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="build" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4">Docker Build Process</h4>
                  <p className="text-muted-foreground mb-4">
                    The Docker build process transforms a Dockerfile into a runnable container image through a series of steps.
                  </p>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h5 className="font-medium">Send build context to Docker daemon</h5>
                        <p className="text-sm text-muted-foreground">The build context (files in the directory) is sent to the Docker daemon</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h5 className="font-medium">Execute instructions sequentially</h5>
                        <p className="text-sm text-muted-foreground">Each instruction is executed in order, creating a new layer</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h5 className="font-medium">Create intermediate containers</h5>
                        <p className="text-sm text-muted-foreground">Each step runs in a temporary container that is then committed as a new image</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                      <div>
                        <h5 className="font-medium">Cache layers when possible</h5>
                        <p className="text-sm text-muted-foreground">Docker reuses cached layers if the instruction and context haven't changed</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                      <div>
                        <h5 className="font-medium">Create the final image</h5>
                        <p className="text-sm text-muted-foreground">After all instructions are processed, the final image is created and tagged</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-secondary/20 p-6 rounded-lg">
                  <div className="relative h-80">
                    {/* Build Context */}
                    <div className="absolute top-0 left-0 w-1/3 h-16 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium text-center">Build Context<br/>(Source Code)</div>
                    </div>
                    
                    {/* Docker Daemon */}
                    <div className="absolute top-0 right-0 w-1/3 h-16 bg-green-500/20 border border-green-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium text-center">Docker Daemon</div>
                    </div>
                    
                    {/* Dockerfile */}
                    <div className="absolute top-24 left-0 w-1/3 h-16 bg-yellow-500/20 border border-yellow-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium text-center">Dockerfile</div>
                    </div>
                    
                    {/* Build Process */}
                    <div className="absolute top-24 right-0 w-1/3 h-40 bg-purple-500/20 border border-purple-500/30 rounded-md flex flex-col items-center justify-center p-2">
                      <div className="text-sm font-medium mb-2">Build Process</div>
                      <div className="text-xs text-muted-foreground text-center">1. Parse Dockerfile<br/>2. Execute each instruction<br/>3. Create layers<br/>4. Cache when possible</div>
                    </div>
                    
                    {/* Final Image */}
                    <div className="absolute bottom-0 right-0 w-1/3 h-16 bg-red-500/20 border border-red-500/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium text-center">Final Image</div>
                    </div>
                    
                    {/* Container */}
                    <div className="absolute bottom-0 left-0 w-1/3 h-16 bg-primary/20 border border-primary/30 rounded-md flex items-center justify-center">
                      <div className="text-sm font-medium text-center">Running Container</div>
                    </div>

                    {/* Connecting Arrows */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-muted-foreground" />
                        </marker>
                      </defs>
                      {/* Context to Daemon */}
                      <line x1="33%" y1="8%" x2="67%" y2="8%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" markerEnd="url(#arrowhead2)" />
                      
                      {/* Dockerfile to Daemon */}
                      <line x1="33%" y1="32%" x2="67%" y2="32%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" markerEnd="url(#arrowhead2)" />
                      
                      {/* Build Process to Image */}
                      <line x1="67%" y1="64%" x2="67%" y2="84%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" markerEnd="url(#arrowhead2)" />
                      
                      {/* Image to Container */}
                      <line x1="67%" y1="92%" x2="33%" y2="92%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" markerEnd="url(#arrowhead2)" />
                    </svg>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="multistage" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4">Multi-stage Build Benefits</h4>
                  <p className="text-muted-foreground mb-4">
                    Multi-stage builds allow you to use multiple FROM statements in your Dockerfile. Each FROM instruction can use a different base, and begins a new stage of the build.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Smaller final images</h5>
                        <p className="text-sm text-muted-foreground">Only the necessary artifacts are copied to the final image</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Separation of build and runtime environments</h5>
                        <p className="text-sm text-muted-foreground">Build tools aren't included in the production image</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Improved security</h5>
                        <p className="text-sm text-muted-foreground">Fewer packages and dependencies means a smaller attack surface</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Simplified Dockerfiles</h5>
                        <p className="text-sm text-muted-foreground">More readable and maintainable build instructions</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-secondary/20 p-6 rounded-lg">
                  <div className="relative h-80">
                    {/* Build Stage */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-blue-500/20 border border-blue-500/30 rounded-md p-4">
                      <div className="text-sm font-medium mb-2">Build Stage</div>
                      <div className="text-xs font-mono bg-background/50 p-2 rounded">
                        FROM node:18 AS build<br/>
                        WORKDIR /app<br/>
                        COPY . .<br/>
                        RUN npm ci && npm run build
                      </div>
                    </div>
                    
                    {/* Runtime Stage */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-500/20 border border-green-500/30 rounded-md p-4">
                      <div className="text-sm font-medium mb-2">Runtime Stage</div>
                      <div className="text-xs font-mono bg-background/50 p-2 rounded">
                        FROM node:18-alpine<br/>
                        WORKDIR /app<br/>
                        COPY --from=build /app/dist .<br/>
                        CMD ["node", "server.js"]
                      </div>
                    </div>

                    {/* Connecting Arrow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-8 h-8 text-primary" />
                        <div className="text-xs text-center mt-1 max-w-32">
                          Only built artifacts are copied to final image
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Best Practices Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <div className="container-surface p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Dockerfile Best Practices</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestPractices.map((practice, index) => (
              <div key={index} className="bg-secondary/20 p-6 rounded-lg">
                <h4 className="text-lg font-medium mb-2">{practice.title}</h4>
                <p className="text-muted-foreground mb-4">{practice.description}</p>
                
                {practice.goodExample && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div className="text-sm font-medium text-green-500">Good Example</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded font-mono text-xs">
                      {practice.goodExample}
                    </div>
                  </div>
                )}
                
                {practice.badExample && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <div className="text-sm font-medium text-red-500">Bad Example</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded font-mono text-xs">
                      {practice.badExample}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Patterns and Anti-patterns Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <div className="container-surface p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Common Patterns & Anti-patterns</h3>
          </div>

          <Tabs defaultValue="patterns">
            <TabsList className="mb-6">
              <TabsTrigger value="patterns">Recommended Patterns</TabsTrigger>
              <TabsTrigger value="antipatterns">Anti-patterns to Avoid</TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patterns.filter(p => !p.isAntiPattern).map((pattern, index) => (
                  <div key={index} className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <h4 className="text-lg font-medium">{pattern.title}</h4>
                    </div>
                    <p className="text-muted-foreground mb-4">{pattern.description}</p>
                    <div className="bg-background/50 p-3 rounded font-mono text-xs overflow-auto max-h-40">
                      {pattern.example}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="antipatterns" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patterns.filter(p => p.isAntiPattern).map((pattern, index) => (
                  <div key={index} className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <h4 className="text-lg font-medium">{pattern.title}</h4>
                    </div>
                    <p className="text-muted-foreground mb-4">{pattern.description}</p>
                    <div className="bg-background/50 p-3 rounded font-mono text-xs overflow-auto max-h-40">
                      {pattern.example}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Dockerfile and Docker Compose Relationship */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <div className="container-surface p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Dockerfile & Docker Compose Relationship</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium mb-4">How They Work Together</h4>
              <p className="text-muted-foreground mb-6">
                Dockerfiles and Docker Compose files serve different but complementary purposes in containerized applications.
              </p>
              
              <div className="space-y-6">
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Dockerfile</h5>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div>Defines how to build a single container image</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div>Focuses on application code, dependencies, and runtime environment</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div>Concerned with the internal structure of a container</div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Docker Compose</h5>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div>Defines multi-container applications</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div>Manages container relationships, networks, volumes, and environment variables</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 min-w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                      </div>
                      <div>Concerned with how containers interact with each other</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-4">Integration Example</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Dockerfile (app service)</div>
                  <div className="bg-background/50 p-3 rounded font-mono text-xs h-60 overflow-auto">
                    {`FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]`}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">docker-compose.yml</div>
                  <div className="bg-background/50 p-3 rounded font-mono text-xs h-60 overflow-auto">
                    {`version: '3.8'

services:
  app:
    build: 
      context: ./app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=database
    depends_on:
      - database
    networks:
      - app-network

  database:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_USER=appuser
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:`}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="mb-2">In this example:</p>
                <ul className="space-y-1">
                  <li>• The Dockerfile defines how to build the app service</li>
                  <li>• Docker Compose references this Dockerfile in the build context</li>
                  <li>• Docker Compose adds networking, volumes, and connects to other services</li>
                  <li>• Docker Compose sets environment variables that the app can use</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DockerfileSection;