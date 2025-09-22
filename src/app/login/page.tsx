import { LoginForm } from './login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { getLoggedInUser } from '../auth/actions';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getLoggedInUser();
  if (user) {
    if (user.type === 'admin') redirect('/admin');
    if (user.type === 'teacher') redirect('/teacher');
    if (user.type === 'student') redirect('/student');
    if (user.type === 'parent') redirect('/parent');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
