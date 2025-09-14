
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
import { addStudent } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  dob: z.string().min(1, { message: 'Date of birth is required.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  fatherName: z.string().min(2, { message: "Father's name is required." }),
  address: z.string().min(5, { message: 'Address is required.' }),
  class: z.string().min(1, { message: 'Please select a class.' }),
});

type AdmissionFormValues = z.infer<typeof formSchema>;

export function AdmissionForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      dob: '',
      phone: '',
      fatherName: '',
      address: '',
      class: '',
    },
  });

  async function onSubmit(data: AdmissionFormValues) {
    setLoading(true);
    try {
      // In a real application, you might want a separate 'applications' collection
      // For this app, we'll add them as students with a default roll number/section.
      await addStudent({
        ...data,
        rollNumber: 'N/A',
        section: 'N/A',
      });
      toast({
        title: 'Application Submitted',
        description: 'Thank you! Your admission form has been received.',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Could not submit your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                    <Input placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
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
                    <Input placeholder="Enter your phone number" {...field} />
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
                name="class"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Desired Class</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a class to apply for" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="IX">Class IX</SelectItem>
                            <SelectItem value="X">Class X</SelectItem>
                            <SelectItem value="XI">Class XI</SelectItem>
                            <SelectItem value="XII">Class XII</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <Input placeholder="Enter your full address" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Application
        </Button>
      </form>
    </Form>
  );
}
