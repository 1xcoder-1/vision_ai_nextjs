// Utility functions for formatting AI-generated content

export interface OutputMetadata {
  keywords?: string[];
  questions?: string[];
}

export interface FormattedOutput {
  plain: string;
  json: string;
  structured: string;
}

/**
 * Convert plain text content to JSON format
 */
export function convertToJSON(content: string, metadata?: OutputMetadata): any {
  try {
    // Attempt to parse if it's already JSON
    return JSON.parse(content);
  } catch {
    // If not JSON, convert plain text to structured JSON
    const lines = content.split("\n").filter(line => line.trim() !== "");
    const result: any = {
      analysis: []
    };
    
    // Add metadata if available
    if (metadata) {
      result.metadata = metadata;
    }
    
    let currentSection = "main";
    result[currentSection] = [];
    
    lines.forEach(line => {
      if (line.startsWith("Important Information:") || line.startsWith("Other Information:")) {
        currentSection = line.replace(":", "").trim().toLowerCase().replace(/\s+/g, "_");
        result[currentSection] = [];
      } else if (line.match(/^\d+\./) || line.startsWith("-")) {
        const text = line.replace(/^\d+\.\s*|-\s*/, "").trim();
        if (!result[currentSection]) {
          result[currentSection] = [];
        }
        result[currentSection].push(text);
      } else if (line.trim() !== "") {
        if (!result[currentSection]) {
          result[currentSection] = [];
        }
        result[currentSection].push(line.trim());
      }
    });
    
    return result;
  }
}

/**
 * Convert content to structured report format
 */
export function convertToStructuredReport(content: string): string {
  const lines = content.split("\n").filter(line => line.trim() !== "");
  let formattedContent = "";
  let inSection = false;
  
  lines.forEach(line => {
    if (line.startsWith("Important Information:") || line.startsWith("Other Information:")) {
      if (inSection) {
        formattedContent += "\n";
      }
      formattedContent += `## ${line}\n`;
      inSection = true;
    } else if (line.match(/^\d+\./)) {
      formattedContent += `\n${line}`;
    } else if (line.startsWith("-")) {
      formattedContent += `\n   • ${line.substring(1).trim()}`;
    } else if (line.trim() !== "") {
      if (!inSection) {
        formattedContent += `## Analysis Summary\n\n${line}\n`;
        inSection = true;
      } else {
        formattedContent += `\n${line}`;
      }
    }
  });
  
  // Add a title if none exists
  if (!formattedContent.startsWith("##")) {
    formattedContent = `## Image Analysis Report\n\n${formattedContent}`;
  }
  
  return formattedContent;
}

/**
 * Format content in all available formats
 */
export function formatOutput(content: string, metadata?: OutputMetadata): FormattedOutput {
  return {
    plain: content,
    json: JSON.stringify(convertToJSON(content, metadata), null, 2),
    structured: convertToStructuredReport(content)
  };
}