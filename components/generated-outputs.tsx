import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Download, Brain, Zap, Eye } from "lucide-react";
import { formatOutput } from "@/lib/output-formatter";
import OutputFormatSelector from "@/components/output-format-selector";
import jsPDF from "jspdf";

interface GeneratedOutput {
  id: number;
  type: string;
  content: string;
  timestamp: Date;
  format: "plain" | "json" | "structured";
  metadata?: {
    keywords?: string[];
    questions?: string[];
  };
}

const GeneratedOutputs = ({ 
  outputs, 
  format,
  setFormat
}: { 
  outputs: GeneratedOutput[];
  format: "plain" | "json" | "structured";
  setFormat: (format: "plain" | "json" | "structured") => void;
}) => {
  const [notification, setNotification] = useState<{message: string, show: boolean}>({message: '', show: false});

  if (outputs.length === 0) return null;

  // Function to show notification
  const showNotification = (message: string) => {
    setNotification({message, show: true});
    setTimeout(() => {
      setNotification({message: '', show: false});
    }, 3000);
  };

  // Function to export content as TXT or JSON
  const exportContent = (content: string, id: number, exportFormat: "txt" | "json", metadata?: GeneratedOutput['metadata']) => {
    let dataStr = "";
    let fileType = "";
    let fileName = "";
    
    if (exportFormat === "txt") {
      dataStr = content;
      fileType = "text/plain";
      fileName = `visionai-output-${id}.txt`;
    } else {
      const formatted = formatOutput(content, metadata);
      dataStr = formatted.json;
      fileType = "application/json";
      fileName = `visionai-output-${id}.json`;
    }
    
    const dataUri = `data:${fileType};charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  // Function to export content as PDF
  const exportPDF = (content: string, id: number, title: string, metadata?: GeneratedOutput['metadata']) => {
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
    
    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 35, { align: "center" });
    
    // Add content
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    // Format content for PDF
    let yPosition = 50;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;
    
    // Add main content
    const formatted = formatOutput(content, metadata);
    let textContent = "";
    
    switch (format) {
      case "plain":
        textContent = content;
        break;
      case "json":
        textContent = formatted.json;
        break;
      case "structured":
        textContent = formatted.structured;
        break;
    }
    
    // Process content based on format
    if (format === "structured") {
      // For structured content, process headers and lists specially
      const lines = textContent.split("\n");
      lines.forEach((line: string) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin + 10;
        }
        
        if (line.startsWith("## ")) {
          // Header
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(25, 118, 210); // Blue color
          const headerText = line.substring(3);
          doc.text(headerText, margin, yPosition);
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
        } else if (line.startsWith("   •")) {
          // Bullet point
          const splitText = doc.splitTextToSize("• " + line.substring(4).trim(), maxWidth - 10);
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
    } else {
      // For plain and JSON content with improved long text handling
      const splitText = doc.splitTextToSize(textContent, maxWidth);
      let lineHeight = 8;
      splitText.forEach((line: string) => {
        // For very long text, we might need to adjust line height
        if (line.length > 80) {
          lineHeight = 7; // Slightly smaller line height for very long lines
        }
        
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin + 10;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    }
    
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
    doc.save(`visionai-output-${id}.pdf`);
  };

  return (
    <Card className="bg-blue-50 border-t border-gray-200 rounded-2xl overflow-hidden">
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

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <ImageIcon className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-[#1e1e1e]">
                Generated Outputs
              </CardTitle>
              <CardDescription>
                All AI-generated content from your image analysis sessions
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <OutputFormatSelector format={format} onFormatChange={setFormat} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportContent(
                outputs[outputs.length - 1]?.content || "", 
                outputs[outputs.length - 1]?.id || Date.now(), 
                format === "json" ? "json" : "txt",
                outputs[outputs.length - 1]?.metadata
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
                outputs[outputs.length - 1]?.content || "", 
                outputs[outputs.length - 1]?.id || Date.now(), 
                "Image Analysis Report",
                outputs[outputs.length - 1]?.metadata
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
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {outputs.map((output) => (
            <motion.div
              key={output.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {output.type}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      {output.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportContent(output.content, output.id, "txt", output.metadata)}
                      className="flex items-center rounded-full"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      TXT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportContent(output.content, output.id, "json", output.metadata)}
                      className="flex items-center rounded-full"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportPDF(output.content, output.id, "Image Analysis Report", output.metadata)}
                      className="flex items-center rounded-full"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="prose prose-blue max-w-none">
                  {format === "plain" && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(output.content);
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
                        {output.content.split("\n").map((line, index) => {
                          if (
                            line.startsWith("Important Information:") ||
                            line.startsWith("Other Information:")
                          ) {
                            return (
                              <h4
                                key={index}
                                className="text-xl font-semibold mt-4 mb-3 text-blue-700"
                              >
                                {line}
                              </h4>
                            );
                          } else if (line.match(/^\d+\./)) {
                            return (
                              <li key={index} className="ml-6 mb-2 text-gray-700 text-lg">
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
                  
                  {format === "json" && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(formatOutput(output.content, output.metadata).json);
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
                        <pre>{formatOutput(output.content, output.metadata).json}</pre>
                      </div>
                    </div>
                  )}
                  
                  {format === "structured" && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(formatOutput(output.content, output.metadata).structured);
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
                          {formatOutput(output.content, output.metadata).structured.split("\n").map((line, index) => {
                            if (line.startsWith("## ")) {
                              return (
                                <h3 
                                  key={index} 
                                  className="text-xl font-bold mt-6 mb-4 text-[#1e1e1e] border-b border-gray-200 pb-2"
                                >
                                  {line.substring(3)}
                                </h3>
                              );
                            } else if (line.match(/^\d+\./)) {
                              return (
                                <li key={index} className="ml-6 mb-2 text-gray-700">
                                  {line}
                                </li>
                              );
                            } else if (line.startsWith("   •")) {
                              return (
                                <li key={index} className="ml-8 mb-1 text-gray-700 list-disc">
                                  {line.substring(4).trim()}
                                </li>
                              );
                            } else if (line.trim() !== "") {
                              return (
                                <p key={index} className="mb-3 text-gray-700">
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
                
                {output.metadata && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="space-y-6">
                      {output.metadata.keywords && output.metadata.keywords.length > 0 && (
                        <div>
                          <h4 className="text-xl font-semibold mb-4 text-[#1e1e1e] flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                            Related Keywords
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {output.metadata.keywords.map((keyword, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-blue-100 text-blue-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {output.metadata.questions && output.metadata.questions.length > 0 && (
                        <div>
                          <h4 className="text-xl font-semibold mb-4 text-[#1e1e1e] flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-green-500" />
                            Related Questions
                          </h4>
                          <div className="space-y-4">
                            {output.metadata.questions.map((question, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center gap-3"
                              >
                                <div className="flex-1 px-5 py-5 bg-white text-gray-800 border border-gray-200 rounded-lg text-base leading-relaxed min-h-[80px] flex items-center">
                                  {question}
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    navigator.clipboard.writeText(question);
                                    showNotification("Question copied to clipboard!");
                                  }}
                                  className="px-4 py-5 bg-white border border-gray-200 rounded-lg text-gray-800 hover:bg-gray-50 transition-colors duration-200 min-h-[80px] flex items-center"
                                  title="Copy to clipboard"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedOutputs;