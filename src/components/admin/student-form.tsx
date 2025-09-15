
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
import { addStudent, updateStudent } from '@/lib/firebase/realtimedb';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  rollNumber: z.string().min(1, { message: 'Roll number is required.' }),
  class: z.string().min(1, { message: 'Class is required.' }),
  section: z.string().min(1, { message: 'Section is required.' }),
  dob: z.string().min(1, { message: 'Date of birth is required.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  fatherName: z.string().min(2, { message: "Father's name is required." }),
  address: z.string().min(5, { message: 'Address is required.' }),
});

type StudentFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  student?: Student;
}

export function StudentForm({ student }: StudentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: student || {
      name: '',
      email: '',
      rollNumber: '',
      class: '',
      section: '',
      dob: '',
      phone: '',
      fatherName: '',
      address: '',
    },
  });

  async function onSubmit(data: StudentFormValues) {
    setLoading(true);
    try {
      if (student) {
        // The updateStudent function in realtimedb now expects the full object.
        // We merge existing student data with the new form data.
        await updateStudent(student.id, { ...student, ...data });
        toast({
          title: 'Student Updated',
          description: 'The student record has been successfully updated.',
        });
      } else {
        await addStudent(data);
        toast({
          title: 'Student Added',
          description: 'A new student has been successfully added.',
        });
      }
      // Redirect after the operation is successful
      router.push('/admin/dashboard/students');
      router.refresh(); 
    } catch (error) {
      console.error("Failed to save student:", error);
      toast({
        title: 'An error occurred',
        description: 'Could not save the student data. Please try again.',
        variant: 'destructive',
      });
    } finally {
        // This block will always run, ensuring the loading state is turned off.
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
            name="rollNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Roll Number</FormLabel>
                <FormControl>
                    <Input placeholder="Enter roll number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., XII" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., A" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
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
             <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter father's name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                    <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {student ? 'Update Student' : 'Add Student'}
        </Button>
      </form>
    </Form>
  );
}
