import { motion } from 'framer-motion';
import { ExternalLink, Download } from 'lucide-react';

interface DockerImage {
  name: string;
  description: string;
  category: string;
  pulls: string;
  icon: string;
  official: boolean;
}

const dockerImages: DockerImage[] = [
  {
    name: 'nginx',
    description: 'High-performance web server and reverse proxy',
    category: 'Web Servers',
    pulls: '1B+',
    icon: '🌐',
    official: true
  },
  {
    name: 'postgres',
    description: 'Advanced open source relational database',
    category: 'Databases',
    pulls: '1B+',
    icon: '🐘',
    official: true
  },
  {
    name: 'node',
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    category: 'Runtimes',
    pulls: '1B+',
    icon: '🟢',
    official: true
  },
  {
    name: 'redis',
    description: 'In-memory data structure store and cache',
    category: 'Databases',
    pulls: '1B+',
    icon: '🔴',
    official: true
  },
  {
    name: 'mysql',
    description: 'Popular open source relational database',
    category: 'Databases',
    pulls: '1B+',
    icon: '🐬',
    official: true
  },
  {
    name: 'mongo',
    description: 'Document-oriented NoSQL database',
    category: 'Databases',
    pulls: '1B+',
    icon: '🍃',
    official: true
  },
  {
    name: 'python',
    description: 'High-level programming language runtime',
    category: 'Runtimes',
    pulls: '1B+',
    icon: '🐍',
    official: true
  },
  {
    name: 'ubuntu',
    description: 'Popular Linux distribution base image',
    category: 'Operating Systems',
    pulls: '1B+',
    icon: '🐧',
    official: true
  },
  {
    name: 'alpine',
    description: 'Lightweight Linux distribution',
    category: 'Operating Systems',
    pulls: '1B+',
    icon: '🏔️',
    official: true
  }
];

const ImageGallery = () => {
  const categories = Array.from(new Set(dockerImages.map(img => img.category)));

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
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start your containerization journey with these battle-tested, community-trusted images from Docker Hub.
        </p>
      </motion.div>

      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: categoryIndex * 0.2 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold mb-6 text-primary">{category}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dockerImages
              .filter(img => img.category === category)
              .map((image, index) => (
                <motion.div
                  key={image.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="image-card container-surface p-6 group cursor-pointer"
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
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {image.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-secondary/50 px-2 py-1 rounded font-mono">
                      docker pull {image.name}
                    </code>
                    <span className="text-xs text-primary font-medium">
                      Pull Image
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ImageGallery;