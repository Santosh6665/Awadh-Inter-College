
'use client';

import { useEffect, useState } from 'react';
import { StudentForm } from '@/components/admin/student-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudent } from '@/lib/firebase/realtimedb';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function EditStudentPage({ params }: { params: { id: string } }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const studentData = await getStudent(params.id);
                if (studentData) {
                    setStudent(studentData);
                } else {
                     toast({
                        title: 'Student not found',
                        description: 'The requested student could not be found.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                 toast({
                    title: 'Error fetching student',
                    description: 'Could not load student data. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [params.id, toast]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <p>Student not found.</p>;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Student Record</CardTitle>
        <CardDescription>Update the student's information below.</CardDescription>
      </CardHeader>
      <CardContent>
        <StudentForm student={student} />
      </CardContent>
    </Card>
  );
}
