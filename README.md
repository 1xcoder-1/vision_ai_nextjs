# VisionAI - Intelligent Image Recognition

## Project Overview

VisionAI is a modern web application built with Next.js that uses Google's Gemini AI to analyze and provide detailed information about uploaded images. The app offers a sleek, user-friendly interface for image upload, displays AI-generated information about the image, and provides related keywords and questions for further exploration.

## Features

- Modern drag-and-drop image upload with preview
- AI-powered image analysis using Google Gemini API
- Detailed information display about the identified image
- Smart keyword extraction for further exploration
- AI-generated related questions about the image
- Regenerate content based on specific keywords
- Ask AI-generated questions for deeper insights
- Multiple output formats (Plain Text, JSON, Structured)
- Export functionality (TXT, JSON, PDF)
- Responsive design with beautiful UI animations
- Content copy functionality with visual feedback

## Tech Stack

- **Next.js 14** (React framework)
- **TypeScript**
- **Tailwind CSS** for styling
- **Google Generative AI (Gemini API)** via `@google/generative-ai` SDK
- **Framer Motion** for animations
- **Lucide React Icons**
- **jsPDF** for PDF export functionality

## Key Functionalities

1. **Modern Image Upload**: Users can upload an image through drag-and-drop or file selection with live preview.
2. **AI Image Analysis**: The uploaded image is sent to the Gemini AI API for advanced analysis.
3. **Beautiful Information Display**: The AI-generated information is displayed in a clean, modern UI with multiple format options.
4. **Smart Keywords**: The app extracts and displays relevant keywords from the AI response.
5. **Related Questions**: The app generates and displays related questions about the image using a separate AI query.
6. **Content Regeneration**: Users can click on keywords to regenerate content with a focus on that specific aspect.
7. **Question Exploration**: Users can click on generated questions to get more specific information about the image.
8. **Multiple Output Formats**: Content can be viewed in Plain Text, JSON, or Structured formats.
9. **Export Options**: Analysis results can be exported as TXT, JSON, or PDF files.
10. **Copy to Clipboard**: One-click copy functionality for content and questions with visual feedback.
11. **Responsive Design**: Fully responsive layout that works on all device sizes.

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Google Gemini API key: `NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_api_key_here`
4. Run the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser

## Project Structure

```
├── app
│   ├── api/identify-image/route.ts      # API route for image identification
│   ├── favicon.tsx                      # Favicon component
│   ├── globals.css                      # Global CSS styles
│   ├── layout.tsx                       # Root layout component
│   ├── logo.tsx                         # Logo component
│   └── page.tsx                         # Main page (now using ImageIdentifier component)
├── components
│   ├── ui/                              # UI components
│   │   ├── advanced-loader.tsx          # Advanced loading animation
│   │   ├── animated-section.tsx         # Animated section wrapper
│   │   ├── button.tsx                   # Custom button component
│   │   ├── card.tsx                     # Card component
│   │   └── loading-spinner.tsx          # Loading spinner component
│   ├── detail-level-selector.tsx        # Detail level selector component
│   ├── footer.tsx                       # Footer component
│   ├── generated-outputs.tsx            # Generated outputs display component
│   ├── header.tsx                       # Header component
│   ├── image-identifier.tsx             # Main image identifier component
│   ├── initial-output-section.tsx       # Initial output section component
│   └── output-format-selector.tsx       # Output format selector component
├── lib
│   ├── output-formatter.ts              # Output formatting utilities
│   └── utils.ts                         # General utility functions
├── snap                                 # Screenshots directory
│   ├── image1.png                       # Landing page screenshot
│   └── image2.png                       # Analysis result screenshot
├── README.md                            # Project documentation
├── components.json                      # Component configuration
├── next.config.mjs                      # Next.js configuration
├── package.json                         # Project dependencies and scripts
├── postcss.config.mjs                   # PostCSS configuration
├── tailwind.config.ts                   # Tailwind CSS configuration
└── tsconfig.json                        # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the production application
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint to check for code issues

## Environment Variables

Create a `.env.local` file in the root directory with the following variable:

```
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_api_key_here
```

## Deployment

This project can be easily deployed on platforms like Vercel or Netlify. Make sure to set up the environment variables in your deployment platform's settings.

## Future Improvements

- Implement user authentication for personalized experiences
- Add image categorization and tagging features
- Implement a gallery of previously analyzed images
- Optimize performance for faster image processing
- Add multi-language support for global users
- Implement image comparison functionality
- Add export options for analysis results
- Implement sharing capabilities for analysis results

