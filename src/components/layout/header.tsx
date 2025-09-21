
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu, User, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from './logo';
import type { Student, Teacher } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/notices', label: 'Notices' },
  { href: '/#contact', label: 'Contact Us' },
];

interface HeaderProps {
    student?: Student | null;
    teacher?: Teacher | null;
}

export function Header({ student, teacher }: HeaderProps) {
  const pathname = usePathname();
  const loggedInPortal = student ? '/student' : teacher ? '/teacher' : null;

  const isStudentPage = pathname.startsWith('/student');
  const isTeacherPage = pathname.startsWith('/teacher');
  const isInPortal = isStudentPage || isTeacherPage;
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const renderProfileIcon = () => {
    if (student) {
      return (
        <Button asChild variant="ghost" size="icon" className="rounded-full border w-9 h-9">
            <Link href="/student">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={student.photoUrl} alt={student.name} />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
            </Link>
        </Button>
      );
    }
    if (teacher) {
        return (
            <Button asChild variant="ghost" size="icon" className="rounded-full border w-9 h-9">
                <Link href="/teacher">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
                        <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                    </Avatar>
                </Link>
            </Button>
        )
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <CircleUserRound className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/student">Student Portal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/teacher">Teacher Portal</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Portal</Link>
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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-6">
             <SheetHeader className="mb-4">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8" />
                    <span className="text-xl font-bold">Awadh Inter College</span>
                </Link>
            </SheetHeader>
            <nav className="grid gap-2 text-lg font-medium">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground"
                >
                {link.label}
                </Link>
            ))}
            {!loggedInPortal && (
                <>
                    <Link href="/student" className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground">
                        Student Portal
                    </Link>
                    <Link href="/teacher" className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground">
                        Teacher Portal
                    </Link>
                </>
            )}
            {isStudentPage && (
                 <Link
                    href="/student/logout"
                    className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-destructive"
                    >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Link>
            )}
             {isTeacherPage && (
                 <Link
                    href="/teacher/logout"
                    className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-destructive"
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
            <Logo className="h-8 w-8" />
            <h1 className="text-xl font-bold tracking-tight text-primary">
            Awadh Inter College
            </h1>
        </Link>
      </div>
      
      <div className="flex items-center md:hidden">
        <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-lg font-bold tracking-tight text-primary">
                Awadh Inter College
            </h1>
        </Link>
      </div>

      {!isInPortal && (
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("transition-colors hover:text-foreground", pathname === link.href ? "text-foreground" : "text-muted-foreground")}
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
         {isStudentPage && (
          <Button asChild variant="ghost" size="sm" className="hidden md:flex">
            <Link href="/student/logout">
              <LogOut className="mr-2 h-4 w-4"/>
              Logout
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
