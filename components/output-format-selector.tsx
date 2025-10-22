import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Code, FileSpreadsheet } from "lucide-react";

interface OutputFormatSelectorProps {
  format: "plain" | "json" | "structured";
  onFormatChange: (format: "plain" | "json" | "structured") => void;
}

const OutputFormatSelector: React.FC<OutputFormatSelectorProps> = ({ 
  format, 
  onFormatChange 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={format === "plain" ? "default" : "outline"}
        size="sm"
        onClick={() => onFormatChange("plain")}
        className="flex items-center rounded-full"
      >
        <FileText className="w-4 h-4 mr-2" />
        Plain Text
      </Button>
      <Button
        variant={format === "json" ? "default" : "outline"}
        size="sm"
        onClick={() => onFormatChange("json")}
        className="flex items-center rounded-full"
      >
        <Code className="w-4 h-4 mr-2" />
        JSON
      </Button>
      <Button
        variant={format === "structured" ? "default" : "outline"}
        size="sm"
        onClick={() => onFormatChange("structured")}
        className="flex items-center rounded-full"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Structured Report
      </Button>
    </div>
  );
};

export default OutputFormatSelector;