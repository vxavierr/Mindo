import React from 'react';
import { motion, Variants } from 'framer-motion';

// Variants define HOW the animation happens
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each child appears 0.1s after the previous one
      delayChildren: 0.1,
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  show: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 } // Smooth spring effect
  }
};

export const PageWrapper = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="show"
    className={`h-full w-full overflow-y-auto p-8 scroll-smooth ${className || ''}`}
  >
    {children}
  </motion.div>
);

export const AnimatedCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);