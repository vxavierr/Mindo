import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function GlobalSpotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Use springs for smooth "underwater" movement feel
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Direct update for responsiveness
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute rounded-full opacity-40 mix-blend-overlay"
        style={{
          x: mouseX,
          y: mouseY,
          width: '600px',
          height: '600px',
          top: '-300px',
          left: '-300px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}