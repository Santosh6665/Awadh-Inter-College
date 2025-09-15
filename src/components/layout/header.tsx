
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { CollegeLogo } from '@/components/icons';
import { Separator } from '../ui/separator';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/notices', label: 'Notices' },
  { href: '/#contact', label: 'Contact Us' },
];

export function Header() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/teacher/dashboard');
  const getDashboardPath = () => {
    if (pathname.startsWith('/teacher')) {
      return '/teacher/dashboard';
    }
    return '/dashboard';
  }
  
  const getProfilePath = () => {
    if (pathname.startsWith('/teacher')) {
      // Assuming teachers might have a different profile page in the future
      return '/teacher/dashboard/profile'; 
    }
    return '/dashboard/profile';
  }


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
          <SheetContent side="left" className="flex flex-col">
             <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto">
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
                {!user && (
                    
                    <Link
                        href="/login"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Login
                    </Link>
                    
                )}
                </nav>
                <Separator className="my-6" />
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Contact Us</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                        <span>Ghosiyari Bazar Marg, Ghosiyari Bazar, Daniawar, Basti, Uttar Pradesh – 272148</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>+91 6393071946</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>info@awadhcollege.edu</span>
                    </div>
                    </div>
                </div>
            </div>
             <div className="mt-auto border-t pt-6 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Awadh Inter College.</p>
               <p className="mt-2">
                Support: <a href="mailto:santoshx.dev@gmail.com" className="underline hover:text-foreground">santoshx.dev@gmail.com</a>
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
        {loading ? null : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full border-2 border-black">
                <Avatar>
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || ''} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(getDashboardPath())}>
                <User className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(getProfilePath())}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
