
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu, User, CircleUserRound, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from './logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { logout } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/notices', label: 'Notices' },
  { href: '/#contact', label: 'Contact Us' },
];

interface User {
    id: string;
    type: string;
    name: string;
}

interface HeaderProps {
    user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  }

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.type) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'admin': return '/admin';
      case 'parent': return '/parent';
      default: return '/login';
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderProfileIcon = () => {
    if (user) {
      return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border w-9 h-9">
                     <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
        <Button asChild variant="outline" size="sm">
            <Link href="/login">
                <CircleUserRound className="mr-2 h-4 w-4" />
                Login
            </Link>
        </Button>
    );
  };

  return (
    <header className={cn('sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm', 'print-hidden')}>
      <div className="flex items-center gap-2">
         {isClient && <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-6">
             <SheetHeader className="mb-4">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
            {user ? (
                 <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-destructive"
                    >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            ) : (
                 <Link href="/login" className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground">
                    <CircleUserRound className="h-5 w-5" />
                    Login
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
        </Sheet>}
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
      
      <div className="flex items-center gap-4">
        {isClient && renderProfileIcon()}
      </div>
    </header>
  );
}
