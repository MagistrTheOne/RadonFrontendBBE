import { motion } from 'framer-motion';
import { AITypingIndicator } from './TypingAnimation';

export default function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <AITypingIndicator />
    </motion.div>
  );
}
