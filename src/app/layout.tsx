import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antigravity Connect | Cyberpunk Connect Four",
  description: "A modernized Connect Four game with Antigravity physics and AI coaching.",
};

import AuthModal from "@/components/AuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-dark-bg text-foreground font-sans">
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Cyberpunk grid background effect */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
               style={{
                 backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px',
                 perspective: '1000px',
                 transform: 'rotateX(60deg) scale(2.5) translateY(-50%)',
                 transformOrigin: 'top center'
               }}>
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </main>
        <AuthModal />
      </body>
    </html>
  );
}
