import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/providers/ToastProvider';
import { ConfettiProvider } from '@/providers/ConfettiProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'React - Learning module system',
  description: 'A simple learning module system using react and nextjs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={inter.className}>
          <ToastProvider />
          <ConfettiProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
