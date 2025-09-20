'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createAccount, loginAdmin } from './actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleLogin(data: LoginFormValues) {
    setLoading(true);
    const result = await loginAdmin(data);
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: 'Redirecting to dashboard...',
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: result.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  }

  async function handleCreateAccount(data: LoginFormValues) {
     if (!form.getValues().email || !form.getValues().password) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const result = await createAccount(data);
    if (result.success) {
      toast({
        title: 'Account Created',
        description: 'Please ask an administrator to grant you access.',
      });
      form.reset();
    } else {
      toast({
        title: 'Creation Failed',
        description: result.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col space-y-2">
          <Button type="button" onClick={form.handleSubmit(handleLogin)} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleCreateAccount(form.getValues())}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
    </Form>
  );
}
