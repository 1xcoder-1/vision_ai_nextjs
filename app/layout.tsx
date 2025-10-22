import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Logo from "./logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisionAI - Intelligent Image Recognition",
  description: "Advanced AI-powered image analysis and recognition platform",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white`}>
        {children}
      </body>
    </html>
  );
}