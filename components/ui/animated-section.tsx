"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  className = '',
  delay = 0,
  id
}) => {
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut",
        delay: delay / 1000
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;