// This comment is added to force a rebuild and potentially resolve a ChunkLoadError.
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, Briefcase, UserCog } from 'lucide-react';
import Link from 'next/link';

const roles = [
  { name: 'Student', href: '/student/login', icon: User, description: 'Access your academic dashboard.' },
  { name: 'Parent', href: '/parent/login', icon: Briefcase, description: 'Monitor your child\'s progress.' },
  { name: 'Teacher', href: '/teacher/login', icon: Shield, description: 'Manage your classes and students.' },
  { name: 'Admin', href: '/admin/login', icon: UserCog, description: 'Oversee the entire institution.' },
];

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Select Your Role</CardTitle>
            <CardDescription className="text-center">
              Please choose your role to proceed to the login page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role) => (
                <Link key={role.name} href={role.href} passHref>
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center text-center p-4">
                    <role.icon className="h-8 w-8 mb-2 text-primary" />
                    <span className="font-semibold">{role.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
