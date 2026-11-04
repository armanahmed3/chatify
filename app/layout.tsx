import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Chatify — AI chatbot for small businesses",
  description:
    "A chatbot that learns your business from your website and answers customer questions, collecting contact details from people who want to book.",
  keywords: [
    "AI Chatbot",
    "Customer Support AI",
    "WhatsApp AI Bot",
    "Lead Capture Chatbot",
    "Small Business AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
