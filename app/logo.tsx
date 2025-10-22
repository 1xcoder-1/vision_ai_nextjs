"use client";

import React from "react";

const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Outer circle with solid color */}
        <div 
          className="rounded-full bg-blue-600 flex items-center justify-center shadow-md"
          style={{ 
            width: size, 
            height: size
          }}
        >
          {/* Inner eye shape */}
          <div 
            className="rounded-full bg-white flex items-center justify-center"
            style={{ 
              width: size * 0.6, 
              height: size * 0.6 
            }}
          >
            {/* Pupil with solid color */}
            <div 
              className="rounded-full bg-blue-600"
              style={{ 
                width: size * 0.3, 
                height: size * 0.3 
              }}
            />
          </div>
        </div>
        
        {/* Simple dot instead of sparkle */}
        <div
          className="absolute -top-1 -right-1 rounded-full bg-blue-400"
          style={{ 
            width: size * 0.2, 
            height: size * 0.2 
          }}
        />
      </div>
    </div>
  );
};

export default Logo;