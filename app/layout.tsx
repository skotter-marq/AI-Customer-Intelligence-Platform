'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { AuthProvider } from "../contexts/AuthContext";
import AuthGuard from "../components/AuthGuard";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isPublicPage = pathname === '/public-changelog' || pathname === '/register' || pathname === '/blog' || pathname.startsWith('/blog/');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {isLoginPage || isPublicPage ? (
            // Public pages without AuthGuard or Navigation
            children
          ) : (
            // All other pages with AuthGuard and Navigation
            <AuthGuard>
              <div className="flex min-h-screen">
                <Navigation />
                <main className="flex-1" style={{ marginLeft: '250px' }}>
                  {children}
                </main>
              </div>
            </AuthGuard>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
