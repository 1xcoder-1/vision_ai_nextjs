import React from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface DetailLevelSelectorProps {
  detailLevel: "short" | "medium" | "large";
  onDetailLevelChange: (level: "short" | "medium" | "large") => void;
}

const DetailLevelSelector: React.FC<DetailLevelSelectorProps> = ({ 
  detailLevel, 
  onDetailLevelChange 
}) => {
  const getLabel = (level: "short" | "medium" | "large") => {
    switch (level) {
      case "short": return "Short";
      case "medium": return "Medium";
      case "large": return "Detailed";
    }
  };

  const getDescription = (level: "short" | "medium" | "large") => {
    switch (level) {
      case "short": return "Brief overview";
      case "medium": return "Balanced detail";
      case "large": return "Comprehensive analysis";
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-2">
        <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Detail Level</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["short", "medium", "large"] as const).map((level) => (
          <Button
            key={level}
            variant={detailLevel === level ? "default" : "outline"}
            size="sm"
            onClick={() => onDetailLevelChange(level)}
            className="flex flex-col items-center rounded-lg px-3 py-2 h-auto"
          >
            <span className="font-medium">{getLabel(level)}</span>
            <span className="text-xs opacity-80">{getDescription(level)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DetailLevelSelector;