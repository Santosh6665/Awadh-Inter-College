
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { getStudentByEmail, getAttendanceForStudent } from '@/lib/firebase/firestore';
import type { Student, AttendanceRecord } from '@/lib/types';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email) {
          try {
            const studentData = await getStudentByEmail(currentUser.email);
            if (studentData) {
              setStudent(studentData);
              const attendanceData = await getAttendanceForStudent(studentData.id);
              setAttendance(attendanceData);
            } else {
              toast({
                title: 'Student not found',
                description: 'Could not find a student profile for your account.',
                variant: 'destructive',
              });
            }
          } catch (error) {
            toast({
              title: 'Error fetching data',
              description: 'Could not load your attendance data.',
              variant: 'destructive',
            });
          }
        }
      } else {
        // Handle user not logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Present':
        return 'default';
      case 'Absent':
        return 'destructive';
      case 'Late':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Record</CardTitle>
        <CardDescription>Your attendance history for the current semester.</CardDescription>
      </CardHeader>
      <CardContent>
        {attendance.length === 0 && !loading ? (
            <p>No attendance records found.</p>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendance
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => (
                    <TableRow key={record.date}>
                        <TableCell>{format(new Date(record.date), 'MMMM do, yyyy')}</TableCell>
                        <TableCell className="text-right">
                        <Badge variant={getBadgeVariant(record.status)}>
                            {record.status}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
