// src/app/layout.tsx
// No 'use client' here, this is a Server Component

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LayoutRenderer from '@/components/LayoutRenderer'; // New client component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = { // This is now valid
  title: 'HandyTask',
  description: 'Simplified task management for handyman jobs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutRenderer>{children}</LayoutRenderer>
      </body>
    </html>
  );
}
