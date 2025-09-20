
'use client';

import { useEffect, useState } from 'react';
import { FaqAssistant } from '@/components/dashboard/faq-assistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckSquare, BarChart2, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { getStudentByEmail, getAttendanceForStudent } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendancePercentage, setAttendancePercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser?.email) {
        try {
          const studentData = await getStudentByEmail(currentUser.email);
          setStudent(studentData);
          if (studentData) {
            const attendanceData = await getAttendanceForStudent(studentData.id);
            if (attendanceData.length > 0) {
              const presentCount = attendanceData.filter(a => a.status === 'Present' || a.status === 'Late').length;
              const percentage = Math.round((presentCount / attendanceData.length) * 100);
              setAttendancePercentage(percentage);
            }
          }
        } catch (error) {
          toast({
            title: 'Error fetching dashboard data',
            description: 'Could not load your academic information.',
            variant: 'destructive'
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);
  
  const getAverageMarks = () => {
    if (!student?.marks) return 0;
    const marks = Object.values(student.marks).filter(m => typeof m === 'number') as number[];
    if (marks.length === 0) return 0;
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    return Math.round(total / marks.length);
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            Here you can find a quick overview of your academic information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{attendancePercentage}%</div>
                    <p className="text-xs text-muted-foreground">Overall attendance this semester</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{getAverageMarks()}%</div>
                    <p className="text-xs text-muted-foreground">Average in Mid-term Examination</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{student?.amountDue || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        Status: {student?.feeStatus || 'N/A'}
                    </p>
                </CardContent>
                </Card>
            </div>
          )}
        </CardContent>
      </Card>
      <FaqAssistant />
    </div>
  );
}
