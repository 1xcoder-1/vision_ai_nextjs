import React from "react";
import Logo from "@/app/logo";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <div className="flex items-center space-x-3 mb-6">
            <Logo size={36} />
            <h2 className="text-2xl font-bold text-white">
              VisionAI
            </h2>
          </div>
          
          <p className="text-gray-400 mb-6 max-w-md">
            Advanced AI-powered image analysis and recognition platform.
          </p>
          
          <div className="border-t border-gray-800 pt-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                support@visionai.com
              </p>
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} VisionAI - Intelligent Image Recognition. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;