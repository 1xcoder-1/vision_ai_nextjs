import React from "react";
import { motion } from "framer-motion";

const AdvancedLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer glowing ring */}
        <motion.div
          className="absolute w-full h-full border-4 border-blue-400 rounded-full opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: 360 
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "linear"
          }}
        />
        
        {/* Main rotating ring with gradient effect */}
        <motion.div
          className="absolute w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-cyan-500 rounded-full shadow-lg"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear"
          }}
        />
        
        {/* Inner rotating ring */}
        <motion.div
          className="absolute w-24 h-24 border-4 border-transparent border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-blue-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
        />
        
        {/* Pulsing center orb with glow */}
        <motion.div
          className="absolute w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
            boxShadow: [
              "0 0 10px rgba(59, 130, 246, 0.5)",
              "0 0 20px rgba(147, 51, 234, 0.8)",
              "0 0 10px rgba(59, 130, 246, 0.5)"
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles with random movement */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
              left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Additional decorative elements */}
        <motion.div
          className="absolute w-16 h-16 border-2 border-blue-300 rounded-full opacity-30"
          animate={{
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360]
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.h2
          className="text-3xl font-bold text-gray-800 mb-2"
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
          style={{
            background: "linear-gradient(90deg, #1e40af, #7e22ce, #0891b2, #1e40af)",
            backgroundSize: "300% 300%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Analyzing your image
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        >
          Our AI is working hard to understand your image
        </motion.p>
      </motion.div>
      
      {/* Progress indicator */}
      <div className="mt-8 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

export default AdvancedLoader;