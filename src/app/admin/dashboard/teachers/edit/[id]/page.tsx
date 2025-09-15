
'use client';

import { useEffect, useState } from 'react';
import { TeacherForm } from '@/components/admin/teacher-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTeacher } from '@/lib/firebase/realtimedb';
import type { Teacher } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function EditTeacherPage({ params }: { params: { id: string } }) {
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const teacherData = await getTeacher(params.id);
                if (teacherData) {
                    setTeacher(teacherData);
                } else {
                     toast({
                        title: 'Teacher not found',
                        description: 'The requested teacher could not be found.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                 toast({
                    title: 'Error fetching teacher',
                    description: 'Could not load teacher data. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [params.id, toast]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return <p>Teacher not found.</p>;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Teacher Record</CardTitle>
        <CardDescription>Update the teacher's information below.</CardDescription>
      </CardHeader>
      <CardContent>
        <TeacherForm teacher={teacher} />
      </CardContent>
    </Card>
  );
}
