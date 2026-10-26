import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                // Suppress third-party Chrome/browser extension exceptions from crashing the Next.js dev overlay
                window.addEventListener('error', function(e) {
                  var file = e.filename || (e.error && e.error.stack) || '';
                  var msg = e.message || '';
                  if (
                    file.indexOf('chrome-extension://') !== -1 ||
                    file.indexOf('moz-extension://') !== -1 ||
                    file.indexOf('safari-extension://') !== -1 ||
                    msg.indexOf('M_ID') !== -1 ||
                    msg.indexOf('executors/200.js') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason || '');
                  if (
                    reason.indexOf('chrome-extension://') !== -1 ||
                    reason.indexOf('moz-extension://') !== -1 ||
                    reason.indexOf('M_ID') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
