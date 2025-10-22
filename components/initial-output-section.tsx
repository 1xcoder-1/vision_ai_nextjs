import React from "react";
import { motion } from "framer-motion";
import { Brain, Upload } from "lucide-react";
import OutputFormatSelector from "@/components/output-format-selector";

const InitialOutputSection = ({ 
  className = "",
  format,
  setFormat
}: { 
  className?: string;
  format: "plain" | "json" | "structured";
  setFormat: (format: "plain" | "json" | "structured") => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.5 }}
      className={`bg-blue-50 p-6 md:p-10 border-t border-gray-200 rounded-b-2xl transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <Brain className="w-8 h-8 mr-3 text-blue-600" />
          <h3 className="text-2xl font-bold text-[#1e1e1e]">
            Analysis Results
          </h3>
        </div>
        <div className="mt-4 sm:mt-0">
          <OutputFormatSelector format={format} onFormatChange={setFormat} />
        </div>
      </div>
      
      <motion.div 
        className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center transition-all duration-300"
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Upload className="w-16 h-16 text-blue-500 mb-6" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No Analysis Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Upload an image and click "Analyze Image" to see detailed insights, keywords, and related questions.
          </p>
          
          <div className="prose prose-blue max-w-none mb-6">
            {format === "plain" && (
              <div className="text-left">
                <p className="text-gray-700 mb-4">
                  Your AI-generated analysis will appear here in a clear, readable format.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1">
                      <span className="text-blue-600 text-xs">1</span>
                    </div>
                    <span className="text-gray-700">Image identification and description</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1">
                      <span className="text-blue-600 text-xs">2</span>
                    </div>
                    <span className="text-gray-700">Related keywords for better understanding</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1">
                      <span className="text-blue-600 text-xs">3</span>
                    </div>
                    <span className="text-gray-700">AI-generated questions for deeper insights</span>
                  </li>
                </ul>
              </div>
            )}
            
            {format === "json" && (
              <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm text-left overflow-x-auto">
                <pre>{`{
  "analysis": "Your AI-generated analysis will appear here",
  "image": "Image identification and description",
  "keywords": ["related", "keywords", "will", "appear", "here"],
  "questions": [
    "AI-generated questions will appear here",
    "For deeper insights about your image"
  ]
}`}</pre>
              </div>
            )}
            
            {format === "structured" && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-left">
                <pre className="whitespace-pre-wrap text-gray-700">{`# Image Analysis Results

## Image Identification
Your AI-generated image identification will appear here

## Key Information
• Detailed description of the image content
• Important features and characteristics

## Related Keywords
• keyword1, keyword2, keyword3

## Suggested Questions
1. AI-generated question 1
2. AI-generated question 2`}</pre>
              </div>
            )}
          </div>
          
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg max-w-md">
            <p className="text-blue-700">
              <span className="font-semibold">Tip:</span> Try uploading images of objects, scenes, or documents for the best results!
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InitialOutputSection;