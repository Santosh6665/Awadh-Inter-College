import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { getLoggedInStudent } from './student/actions';
import { getLoggedInTeacher } from './teacher/actions';
import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Awadh Inter College',
  description: 'A digital information hub for Awadh Inter College.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const student = await getLoggedInStudent();
  const teacher = await getLoggedInTeacher();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        {/* The header is now part of the layout for non-portal pages */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
