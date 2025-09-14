
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getStudents, saveAttendance, getAttendanceForDate } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export default function ManageAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      try {
        const [studentList, attendanceRecords] = await Promise.all([
            getStudents(),
            getAttendanceForDate(today),
        ]);
        
        setStudents(studentList);

        const initialAttendance: Record<string, AttendanceStatus> = {};
        studentList.forEach(student => {
          const record = attendanceRecords.find(r => r.studentId === student.id);
          initialAttendance[student.id] = record ? record.status : 'Present';
        });
        setAttendance(initialAttendance);

      } catch (error) {
        toast({
          title: 'Error loading data',
          description: 'Could not load student or attendance data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [toast, today]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const recordsToSave = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await saveAttendance(recordsToSave, today);
      toast({
        title: 'Attendance Saved',
        description: `Attendance for ${format(new Date(), 'MMMM do, yyyy')} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error Saving Attendance',
        description: 'Could not save attendance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Attendance</CardTitle>
          <CardDescription>
            Mark student attendance for {format(new Date(), 'MMMM do, yyyy')}.
          </CardDescription>
        </div>
        <Button onClick={handleSaveAttendance} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Attendance
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-right">
                    <RadioGroup
                      value={attendance[student.id] || 'Present'}
                      onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                      className="flex justify-end gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Present" id={`present-${student.id}`} />
                        <Label htmlFor={`present-${student.id}`}>Present</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Absent" id={`absent-${student.id}`} />
                        <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Late" id={`late-${student.id}`} />
                        <Label htmlFor={`late-${student.id}`}>Late</Label>
                      </div>
                    </RadioGroup>
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
