import { motion } from 'framer-motion';

export default function ThinkingIndicator() {
  return (
    <motion.div 
      className="flex items-center gap-3 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-3 h-3 rounded-full bg-cyan-400/80 blur-sm shadow-glow"
      />
      <span className="text-white/60 text-sm">Radon думает...</span>
    </motion.div>
  );
}
