
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Users, UserPlus, FileText, BarChart2, Library, Bus, LogOut, Loader2, Send, FilePieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/dashboard/students', label: 'Manage Students', icon: Users },
  { href: '/admin/dashboard/teachers', label: 'Manage Teachers', icon: UserPlus },
  { href: '/admin/dashboard/fees', label: 'Manage Fees', icon: FileText },
  { href: '/admin/dashboard/results', label: 'Manage Results', icon: BarChart2 },
  { href: '/admin/dashboard/library', label: 'Manage Library', icon: Library },
  { href: '/admin/dashboard/transport', label: 'Manage Transport', icon: Bus },
  { href: '/admin/dashboard/communication', label: 'Communication', icon: Send },
  { href: '/admin/dashboard/reports', label: 'Reports', icon: FilePieChart },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // In a real app, you would have role-based checks to ensure the user is an admin.
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/admin/login');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <div className="flex-1 container mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 py-8">
        <aside>
          <Card>
            <CardContent className="p-4">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
                 <Button
                    variant="ghost"
                    className="justify-start mt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
