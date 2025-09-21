
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu, User, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { CollegeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/notices', label: 'Notices' },
  { href: '/student', label: 'Student Portal' },
  { href: '/#contact', label: 'Contact Us' },
];

export function Header() {
  const pathname = usePathname();
  const [loggedInPortal, setLoggedInPortal] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    if (getCookie('student_id')) {
      setLoggedInPortal('/student');
    } else if (getCookie('teacher_id')) {
      setLoggedInPortal('/teacher');
    } else {
      setLoggedInPortal(null);
    }
  }, [pathname]);

  const isStudentPage = pathname.startsWith('/student');
  const isTeacherPage = pathname.startsWith('/teacher');
  const isInPortal = isStudentPage || isTeacherPage;

  const renderProfileIcon = () => {
    if (loggedInPortal) {
      return (
        <Button asChild variant="ghost" size="icon" className="rounded-full border">
            <Link href={loggedInPortal}>
                <CircleUserRound className="h-6 w-6" />
            </Link>
        </Button>
      );
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border">
                    <User className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/student">Student Portal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/teacher">Teacher Portal</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  };

  return (
    <header className={cn('sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm', 'print-hidden')}>
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
            {isStudentPage && (
                 <Link
                    href="/student/logout"
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-destructive"
                    >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Link>
            )}
             {isTeacherPage && (
                 <Link
                    href="/teacher/logout"
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-destructive"
                    >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Link>
            )}
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

      {!isInPortal && (
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
      )}
      
      <div className="flex items-center gap-4">
        {renderProfileIcon()}
        {isTeacherPage && (
          <Button asChild variant="ghost" size="sm" className="hidden md:flex">
            <Link href="/teacher/logout">
              <LogOut className="mr-2 h-4 w-4"/>
              Logout
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
