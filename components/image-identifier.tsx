"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Upload, Sparkles, Eye, Zap, Brain, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdvancedLoader from "@/components/ui/advanced-loader";
import AnimatedSection from "@/components/ui/animated-section";
import GeneratedOutputs from "@/components/generated-outputs";
import Header from "@/components/header";
import Footer from "@/components/footer";
import InitialOutputSection from "@/components/initial-output-section";
import OutputFormatSelector from "@/components/output-format-selector";
import DetailLevelSelector from "@/components/detail-level-selector";
import { formatOutput } from "@/lib/output-formatter";
import jsPDF from "jspdf";

// Define the interface for generated outputs
interface GeneratedOutput {
  id: number;
  type: string;
  content: string;
  timestamp: Date;
  format: "plain" | "json" | "structured";
  detailLevel: "short" | "medium" | "large";
  metadata?: {
    keywords?: string[];
    questions?: string[];
  };
}

const ImageIdentifier = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutput[]>([]);
  const [format, setFormat] = useState<"plain" | "json" | "structured">("plain");
  const [detailLevel, setDetailLevel] = useState<"short" | "medium" | "large">("medium");
  const [notification, setNotification] = useState<{message: string, show: boolean}>({message: '', show: false});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to show notification
  const showNotification = (message: string) => {
    setNotification({message, show: true});
    setTimeout(() => {
      setNotification({message: '', show: false});
    }, 3000);
  };

  useEffect(() => {
    // Clean up object URLs
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setKeywords([]);
      setRelatedQuestions([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const identifyImage = async (additionalPrompt: string = "") => {
    if (!image) return;

    setLoading(true);
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
      const imageParts = await fileToGenerativePart(image);
      
      // Adjust prompt based on detail level
      let detailPrompt = "";
      switch (detailLevel) {
        case "short":
          detailPrompt = "Provide a brief, concise analysis with only the most essential information. Keep the response short and to the point.";
          break;
        case "medium":
          detailPrompt = "Provide a balanced analysis with moderate detail. Include key information but keep it reasonably concise.";
          break;
        case "large":
          detailPrompt = "Provide a comprehensive, detailed analysis with extensive information. Be thorough and include as much relevant detail as possible.";
          break;
      }
      
      const result = await model.generateContent([
        `Identify this image and provide its name and important information including a brief explanation about that image. ${detailPrompt} ${additionalPrompt}`,
        imageParts,
      ]);
      const response = await result.response;
      const text = response
        .text()
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n");
      setResult(text);
      generateKeywords(text);
      await generateRelatedQuestions(text);
      
      // Add to generated outputs with metadata
      const newOutput: GeneratedOutput = {
        id: Date.now(),
        type: "analysis",
        content: text,
        timestamp: new Date(),
        format: format,
        detailLevel: detailLevel,
        metadata: {
          keywords: [...keywords],
          questions: [...relatedQuestions]
        }
      };
      
      setGeneratedOutputs(prev => [...prev, newOutput]);
    } catch (error) {
      console.error("Error identifying image:", error);
      let errorMessage = "An unknown error occurred while identifying the image.";
      
      if (error instanceof Error) {
        // Check if it's a GoogleGenerativeAI error
        if (error.message.includes("503") && error.message.includes("overloaded")) {
          errorMessage = "The AI model is currently overloaded. Please try again in a few minutes.";
        } else {
          errorMessage = `Error identifying image: ${error.message}`;
        }
      }
      
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateKeywords = (text: string) => {
    const words = text.split(/\s+/);
    const keywordSet = new Set<string>();
    words.forEach((word) => {
      if (
        word.length > 4 &&
        !["this", "that", "with", "from", "have", "will", "been", "were", "been", "have", "had", "has"].includes(word.toLowerCase())
      ) {
        keywordSet.add(word);
      }
    });
    setKeywords(Array.from(keywordSet).slice(0, 8));
  };

  const regenerateContent = (keyword: string) => {
    let detailPrompt = "";
    switch (detailLevel) {
      case "short":
        detailPrompt = "Provide a brief, concise response with only the most essential information.";
        break;
      case "medium":
        detailPrompt = "Provide a balanced response with moderate detail.";
        break;
      case "large":
        detailPrompt = "Provide a comprehensive, detailed response with extensive information.";
        break;
    }
    
    identifyImage(`Focus more on aspects related to "${keyword}". ${detailPrompt}`);
  };

  const generateRelatedQuestions = async (text: string) => {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
      const result = await model.generateContent([
        `Based on the following information about an image, generate 5 related questions that someone might ask to learn more about the subject:

        ${text}

        Format the output as a simple list of questions, one per line.`,
      ]);
      const response = await result.response;
      const questions = response.text().trim().split("\n").filter(q => q.trim() !== "");
      setRelatedQuestions(questions.slice(0, 5));
    } catch (error) {
      console.error("Error generating related questions:", error);
      setRelatedQuestions([]);
    }
  };

  const askRelatedQuestion = (question: string) => {
    let detailPrompt = "";
    switch (detailLevel) {
      case "short":
        detailPrompt = "Provide a brief, concise response with only the most essential information.";
        break;
      case "medium":
        detailPrompt = "Provide a balanced response with moderate detail.";
        break;
      case "large":
        detailPrompt = "Provide a comprehensive, detailed response with extensive information.";
        break;
    }
    
    identifyImage(
      `Answer the following question about the image: "${question}" ${detailPrompt}`
    );
  };

  // Function to export content
  const exportContent = (content: string, id: number, exportFormat: "txt" | "json", metadata?: { keywords?: string[], questions?: string[] }) => {
    let dataStr = "";
    let fileType = "";
    let fileName = "";
    
    if (exportFormat === "txt") {
      dataStr = `Detail Level: ${detailLevel}\n\n${content}`;
      fileType = "text/plain";
      fileName = `visionai-output-${id}-${detailLevel}.txt`;
    } else {
      const formatted = formatOutput(content, metadata);
      const jsonData = {
        detailLevel: detailLevel,
        ...formatted
      };
      dataStr = JSON.stringify(jsonData, null, 2);
      fileType = "application/json";
      fileName = `visionai-output-${id}-${detailLevel}.json`;
    }
    
    const dataUri = `data:${fileType};charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  // Function to export content as PDF
  const exportPDF = (content: string, id: number, title: string, metadata?: { keywords?: string[], questions?: string[] }) => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: title,
      subject: 'Image Analysis Report',
      author: 'VisionAI Image Identifier',
      keywords: 'image, analysis, ai, report'
    });
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(25, 118, 210); // Blue color
    doc.text(title, 105, 25, { align: "center" });
    
    // Detail level and timestamp
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Detail Level: ${detailLevel}`, 105, 35, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 42, { align: "center" });
    
    // Add content
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    // Format content for PDF
    let yPosition = 55;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;
    
    // Process content with better formatting
    const lines = content.split("\n");
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin + 10;
      }
      
      if (line.startsWith("Important Information:") || line.startsWith("Other Information:")) {
        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(25, 118, 210); // Blue color
        doc.text(line, margin, yPosition);
        yPosition += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0);
      } else if (line.match(/^\d+\./)) {
        // Numbered list
        const splitText = doc.splitTextToSize(line, maxWidth - 10);
        splitText.forEach((txt: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin + 10;
          }
          doc.text(txt, margin + 10, yPosition);
          yPosition += 8;
        });
      } else if (line.startsWith("-")) {
        // Bullet point
        const splitText = doc.splitTextToSize("• " + line.substring(1).trim(), maxWidth - 10);
        splitText.forEach((txt: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin + 10;
          }
          doc.text(txt, margin + 15, yPosition);
          yPosition += 8;
        });
      } else if (line.trim() !== "") {
        // Regular text with proper wrapping for long text
        const splitText = doc.splitTextToSize(line, maxWidth);
        let lineHeight = 8;
        splitText.forEach((txt: string) => {
          // For very long text, we might need to adjust line height
          if (txt.length > 80) {
            lineHeight = 7; // Slightly smaller line height for very long lines
          }
          
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin + 10;
          }
          doc.text(txt, margin, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 5; // Small gap between paragraphs
      }
    });
    
    // Add metadata if available
    if (metadata) {
      // Check if we need a new page for metadata
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      } else {
        yPosition += 15; // Add some space
      }
      
      // Draw a separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Add keywords section
      if (metadata.keywords && metadata.keywords.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 255); // Blue color
        doc.text("Related Keywords:", margin, yPosition);
        yPosition += 12;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0);
        
        const keywordsText = metadata.keywords.join(", ");
        const keywordLines = doc.splitTextToSize(keywordsText, maxWidth);
        keywordLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }
      
      // Add questions section
      if (metadata.questions && metadata.questions.length > 0) {
        // Check if we need a new page for questions
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 128, 0); // Green color
        doc.text("Related Questions:", margin, yPosition);
        yPosition += 15; // Increased spacing after header
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0);
        
        metadata.questions.forEach((question, index) => {
          if (yPosition > pageHeight - 40) { // Adjusted threshold
            doc.addPage();
            yPosition = margin + 10; // Add some top margin on new page
          }
          // Format questions as a numbered list with better spacing
          const questionText = `${index + 1}. ${question}`;
          const questionLines = doc.splitTextToSize(questionText, maxWidth - 10);
          questionLines.forEach((line: string, lineIndex: number) => {
            if (yPosition > pageHeight - 40) { // Adjusted threshold
              doc.addPage();
              yPosition = margin + 10; // Add some top margin on new page
            }
            doc.text(line, margin + 5, yPosition);
            yPosition += 8; // Increased line spacing
          });
          yPosition += 5; // Increased gap between questions
        });
      }
    }
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: "center" });
    }
    
    // Save the PDF
    doc.save(`visionai-output-${id}-${detailLevel}.pdf`);
  };

  async function fileToGenerativePart(file: File): Promise<{
    inlineData: { data: string; mimeType: string };
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {notification.message}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <AnimatedSection className="text-center py-12">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-[#1e1e1e] mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Intelligent Image Recognition
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Upload any image and let our AI analyze it to provide detailed insights, related keywords, and interesting questions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex justify-center"
          >
          </motion.div>
        </AnimatedSection>

        {/* Upload Section */}
        <AnimatedSection delay={200}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="mb-16 transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-6 md:p-10">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-100 rounded-xl blur-xl opacity-30 animate-pulse"></div>
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={250}
                          height={250}
                          className="rounded-xl shadow-lg object-contain relative z-10 border-4 border-white"
                        />
                      </div>
                      <p className="text-gray-600 font-medium">
                        Click or drag to upload a different image
                      </p>
                    </div>
                  ) : (
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
                        Upload an Image
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        Drag & drop your image here or click to browse. Supports JPG, PNG, and GIF formats.
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-full shadow-md">
                          Select Image
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                  
                  <div className="flex flex-col items-center">
                    <DetailLevelSelector detailLevel={detailLevel} onDetailLevelChange={setDetailLevel} />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <motion.div
                    whileHover={buttonVariants.hover}
                    whileTap={buttonVariants.tap}
                  >
                    <Button
                      onClick={() => identifyImage()}
                      disabled={!image || loading}
                      className={`flex items-center px-10 py-6 rounded-full font-semibold text-lg transition-all duration-300 shadow-md ${
                        !image || loading
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                      }`}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>

              {/* Loading state inside the card */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50 p-6 md:p-10 border-t border-gray-200 rounded-b-2xl"
                >
                  <AdvancedLoader />
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatedSection>

        {/* Initial Output Section - Shown when user opens the website */}
        {!result && !loading && <InitialOutputSection className="mb-16" format={format} setFormat={setFormat} />}

        {/* Results Section - Separate from the upload card */}
        {result && !loading && (
          <AnimatedSection delay={200} className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6 md:p-10">
                  <div className="text-center mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                      <div className="flex items-center justify-center sm:justify-start">
                        <Brain className="w-8 h-8 mr-3 text-blue-600" />
                        <h3 className="text-3xl font-bold text-[#1e1e1e]">
                          Analysis Results
                        </h3>
                      </div>
                      <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                        <OutputFormatSelector format={format} onFormatChange={setFormat} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportContent(
                            result || "", 
                            Date.now(), 
                            format === "json" ? "json" : "txt",
                            { keywords, questions: relatedQuestions }
                          )}
                          className="flex items-center rounded-full"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportPDF(
                            result || "", 
                            Date.now(), 
                            "Image Analysis Report",
                            { keywords, questions: relatedQuestions }
                          )}
                          className="flex items-center rounded-full"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          PDF
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                      Here&apos;s what our AI discovered about your image
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8">
                    <div className="prose prose-blue max-w-none">
                      {format === "plain" && (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(result || "");
                              showNotification("Content copied to clipboard!");
                            }}
                            className="absolute top-0 right-0 flex items-center rounded-full"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </Button>
                          <div className="pt-10">
                            {result.split("\n").map((line, index) => {
                              if (
                                line.startsWith("Important Information:") ||
                                line.startsWith("Other Information:")
                              ) {
                                return (
                                  <h4
                                    key={index}
                                    className="text-2xl font-semibold mt-6 mb-4 text-blue-700"
                                  >
                                    {line}
                                  </h4>
                                );
                              } else if (line.match(/^\d+\./) || line.startsWith("-")) {
                                return (
                                  <li key={index} className="ml-6 mb-3 text-gray-700 text-lg">
                                    {line}
                                  </li>
                                );
                              } else if (line.trim() !== "") {
                                return (
                                  <p key={index} className="mb-4 text-gray-700 text-lg">
                                    {line}
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      {format === "json" && result && (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(formatOutput(result, { keywords, questions: relatedQuestions }).json);
                              showNotification("JSON copied to clipboard!");
                            }}
                            className="absolute top-0 right-0 flex items-center rounded-full"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </Button>
                          <div className="bg-gray-800 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto pt-10">
                            <pre>{formatOutput(result, { keywords, questions: relatedQuestions }).json}</pre>
                          </div>
                        </div>
                      )}
                      
                      {format === "structured" && result && (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(formatOutput(result, { keywords, questions: relatedQuestions }).structured);
                              showNotification("Content copied to clipboard!");
                            }}
                            className="absolute top-0 right-0 flex items-center rounded-full"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </Button>
                          <div className="bg-white border border-gray-200 p-6 rounded-lg pt-10">
                            <div className="prose prose-blue max-w-none">
                              {formatOutput(result, { keywords, questions: relatedQuestions }).structured.split("\n").map((line, index) => {
                                if (line.startsWith("## ")) {
                                  return (
                                    <h3 
                                      key={index} 
                                      className="text-2xl font-bold mt-6 mb-4 text-[#1e1e1e] border-b border-gray-200 pb-2"
                                    >
                                      {line.substring(3)}
                                    </h3>
                                  );
                                } else if (line.match(/^\d+\./)) {
                                  return (
                                    <li key={index} className="ml-6 mb-2 text-gray-700 text-lg">
                                      {line}
                                    </li>
                                );
                                } else if (line.startsWith("   •")) {
                                  return (
                                    <li key={index} className="ml-8 mb-1 text-gray-700 text-lg list-disc">
                                      {line.substring(4).trim()}
                                    </li>
                                  );
                                } else if (line.trim() !== "") {
                                  return (
                                    <p key={index} className="mb-3 text-gray-700 text-lg">
                                      {line}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  {keywords.length > 0 && format === "plain" && (
                    <div className="mt-10">
                      <h4 className="text-2xl font-semibold mb-5 text-[#1e1e1e] flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                        Related Keywords
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {keywords.map((keyword, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={() => regenerateContent(keyword)}
                              variant="outline"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all duration-200 shadow-sm rounded-full px-5 py-2 text-base"
                            >
                              {keyword}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedQuestions.length > 0 && (
                    <div className="mt-12">
                      <h4 className="text-2xl font-semibold mb-6 text-[#1e1e1e] flex items-center">
                        <Eye className="w-6 h-6 mr-2 text-green-500" />
                        Related Questions
                      </h4>
                      <div className="space-y-5">
                        {relatedQuestions.map((question, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-6"
                          >
                            <Button
                              onClick={() => askRelatedQuestion(question)}
                              variant="outline"
                              className="flex-1 text-left bg-white text-gray-800 hover:bg-green-50 transition-colors duration-200 shadow-sm border border-gray-200 justify-start rounded-xl px-6 py-6 text-base whitespace-normal break-words leading-relaxed min-h-[80px] items-start"
                            >
                              {question}
                            </Button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                navigator.clipboard.writeText(question);
                                showNotification("Question copied to clipboard!");
                              }}
                              className="flex items-center rounded-xl px-4 py-6 text-base bg-green-50 hover:bg-green-100 border-green-200 min-h-[80px] border transition-colors duration-200"
                              title="Copy to clipboard"
                            >
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        )}

        {/* How It Works Section */}
        <AnimatedSection id="how-it-works" delay={400} className="mb-16">
          <h2 className="text-4xl font-bold text-center text-[#1e1e1e] mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload Image",
                description: "Drag and drop or select any image from your device for analysis."
              },
              {
                icon: Sparkles,
                title: "AI Analysis",
                description: "Our advanced AI examines your image using cutting-edge computer vision technology."
              },
              {
                icon: Brain,
                title: "Get Insights",
                description: "Receive detailed information, keywords, and related questions about your image."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="h-full"
              >
                <Card className="transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl overflow-hidden h-full bg-white">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 mx-auto">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-center">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-lg">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Features Section */}
        <AnimatedSection id="features" delay={600} className="mb-16">
          <h2 className="text-4xl font-bold text-center text-[#1e1e1e] mb-16">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Accurate Recognition",
                description: "State-of-the-art AI models provide precise image identification and analysis."
              },
              {
                title: "Detailed Insights",
                description: "Get comprehensive information about objects, scenes, and concepts in your images."
              },
              {
                title: "Smart Keywords",
                description: "Discover relevant keywords that help you understand and categorize your images."
              },
              {
                title: "Related Questions",
                description: "Explore your image content further with AI-generated questions for deeper understanding."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl overflow-hidden h-full bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ImageIdentifier;
