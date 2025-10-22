"use client";

import React from "react";

const Favicon = () => {
  return (
    <div className="flex items-center justify-center bg-blue-600 rounded-full w-full h-full">
      <div className="relative">
        {/* Outer circle */}
        <div className="rounded-full bg-white flex items-center justify-center w-[60%] h-[60%]">
          {/* Inner pupil */}
          <div className="rounded-full bg-blue-600 w-[50%] h-[50%]" />
        </div>
        {/* Simple dot */}
        <div className="absolute -top-1 -right-1 rounded-full bg-blue-400 w-2 h-2" />
      </div>
    </div>
  );
};

export default Favicon;