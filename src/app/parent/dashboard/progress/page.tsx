
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { getStudentByEmail } from '@/lib/firebase/realtimedb';
import type { Student } from '@/lib/types';

export default function AcademicProgressPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser?.email) {
        try {
          const studentData = await getStudentByEmail(currentUser.email);
          setStudent(studentData);
        } catch (error) {
          toast({
            title: 'Error fetching progress',
            description: 'Could not load academic progress data.',
            variant: 'destructive',
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const getGrade = (marks?: number): string => {
    if (marks === undefined) return 'N/A';
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  };

  const results = student?.marks ? Object.entries(student.marks).map(([subject, marks]) => ({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      marks: marks,
      grade: getGrade(marks)
  })) : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Monitor your child's grades and performance.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!student || !student.marks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Monitor your child's grades and performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your child's results have not been published yet. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Monitor your child's grades and performance for the mid-term exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Examination Results</h3>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Marks Obtained</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.subject}>
                  <TableCell className="font-medium">{result.subject}</TableCell>
                  <TableCell className="text-right">{result.marks}</TableCell>
                  <TableCell className="text-right">
                    <Badge>{result.grade}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
