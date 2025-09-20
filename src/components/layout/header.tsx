
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { CollegeLogo } from '@/components/icons';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/notices', label: 'Notices' },
  { href: '/#contact', label: 'Contact Us' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
         <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-transparent hover:text-primary">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-6 bg-white">
             <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium mt-8">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
                >
                {link.label}
                </Link>
            ))}
            </nav>
             <div className="mt-auto pt-6 text-center text-xs text-muted-foreground">
                <p>© {new Date().getFullYear()} Awadh Inter College. All rights reserved.</p>
                <p className="mt-2">
                    For technical support, contact our IT Team at <a href="mailto:santoshx.dev@gmail.com" className="underline hover:text-foreground">santoshx.dev@gmail.com</a>
                </p>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="hidden items-center gap-2 md:flex">
            <CollegeLogo className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
            Awadh Inter College
            </h1>
        </Link>
      </div>
      
      <div className="flex items-center md:hidden">
        <Link href="/" className="flex items-center gap-2">
            <CollegeLogo className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-lg font-bold tracking-tight text-primary">
                Awadh Inter College
            </h1>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      
      <div className="flex items-center gap-2">
        {/* Login button removed */}
      </div>
    </header>
  );
}
