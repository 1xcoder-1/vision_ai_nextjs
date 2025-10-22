import React from "react";
import Logo from "@/app/logo";

const Header = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <Logo size={40} />
            <h1 className="text-2xl font-bold text-[#1e1e1e]">
              VisionAI
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-8">
              <li>
                <a
                  href="#"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  Features
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;