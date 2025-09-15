
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getStudentByEmail } from '@/lib/firebase/realtimedb';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email) {
            try {
                const studentData = await getStudentByEmail(currentUser.email);
                setStudent(studentData);
            } catch (error) {
                 toast({
                    title: 'Error fetching profile',
                    description: 'Could not load your profile data.',
                    variant: 'destructive'
                });
            }
        }
      } else {
        // Handle user not logged in case
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>View and manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </CardContent>
       </Card>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load student profile. Please contact administration.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
        <CardDescription>View and manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={student.photoUrl || "https://picsum.photos/seed/student/200"} alt={student.name} data-ai-hint="student portrait" />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <p className="text-muted-foreground">Class {student.class} - Section {student.section}</p>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-2">
            <span className="font-semibold">Roll Number:</span>
            <span>{student.rollNumber}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold">Date of Birth:</span>
            <span>{student.dob}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold">Email:</span>
            <span>{student.email}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold">Phone:</span>
            <span>{student.phone}</span>
          </div>
           <div className="grid grid-cols-2">
            <span className="font-semibold">Father's Name:</span>
            <span>{student.fatherName}</span>
          </div>
           <div className="grid grid-cols-2">
            <span className="font-semibold">Address:</span>
            <span>{student.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
