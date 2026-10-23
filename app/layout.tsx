import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Chatify — AI Chatbot Platform for Small Businesses",
  description:
    "Train a tailored AI chatbot on your website and documents in 5 minutes. Put it on your website, WhatsApp, Instagram, and Facebook with flat monthly pricing.",
  keywords: [
    "AI Chatbot",
    "Customer Support AI",
    "WhatsApp AI Bot",
    "Lead Capture Chatbot",
    "Small Business AI",
  ],
  authors: [{ name: "Chatify Engineering" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
