import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const dotSizeClasses = {
    sm: "w-1 h-1",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} border-4 border-blue-200 rounded-full`}
        />
        <motion.div
          className={`${sizeClasses[size]} absolute top-0 left-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity,
            duration: 1,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${dotSizeClasses[size]} bg-blue-500 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;