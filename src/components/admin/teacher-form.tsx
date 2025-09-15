
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
import { useRouter } from 'next/navigation';
import { addTeacher, updateTeacher } from '@/lib/firebase/realtimedb';
import type { Teacher } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  subject: z.string().min(2, { message: 'Subject is required.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
});

type TeacherFormValues = z.infer<typeof formSchema>;

interface TeacherFormProps {
  teacher?: Teacher;
}

export function TeacherForm({ teacher }: TeacherFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: teacher || {
      name: '',
      email: '',
      subject: '',
      phone: '',
    },
  });

  async function onSubmit(data: TeacherFormValues) {
    setLoading(true);
    try {
      if (teacher) {
        await updateTeacher(teacher.id, data);
        toast({
          title: 'Teacher Updated',
          description: 'The teacher record has been successfully updated.',
        });
      } else {
        await addTeacher(data);
        toast({
          title: 'Teacher Added',
          description: 'A new teacher has been successfully added.',
        });
      }
      router.push('/admin/dashboard/teachers');
      router.refresh();
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Could not save the teacher data. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Physics" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {teacher ? 'Update Teacher' : 'Add Teacher'}
        </Button>
      </form>
    </Form>
  );
}
