
'use client';

import { useState, useTransition, useEffect } from 'react';
import type { Student, AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { getAttendanceByDate, markAttendance } from './actions';
import { useToast } from '@/hooks/use-toast';

export function AttendanceManagement({
  students,
  initialAttendance,
}: {
  students: Student[];
  initialAttendance: AttendanceRecord[];
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    const initialData = initialAttendance.reduce((acc, record) => {
      acc[record.studentId] = record.status;
      return acc;
    }, {} as Record<string, 'Present' | 'Absent' | 'Late'>);
    setAttendance(initialData);
  }, [initialAttendance]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    startTransition(async () => {
      const records = await getAttendanceByDate(newDate);
      const newAttendance = records.reduce((acc, record) => {
        acc[record.studentId] = record.status;
        return acc;
      }, {} as Record<string, 'Present' | 'Absent' | 'Late'>);
      setAttendance(newAttendance);
    });
  };

  const handleStatusChange = (student: Student, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [student.id]: status }));
    startTransition(async () => {
      const result = await markAttendance(student, selectedDate, status);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
        // Revert state on failure
        setAttendance(prev => {
            const newState = { ...prev };
            delete newState[student.id];
            return newState;
        });
      }
    });
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class === classFilter : true;
    return nameMatch && classMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Manage Attendance</CardTitle>
            <CardDescription>Select a date and mark student attendance.</CardDescription>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full sm:w-auto"
            disabled={isPending}
          />
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Input
            placeholder="Filter by class..."
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full sm:max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading attendance data...</TableCell>
                </TableRow>
              )}
              {!isPending && filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const currentStatus = attendance[student.id];
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{`${student.class}-${student.section}`}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant={currentStatus === 'Present' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(student, 'Present')}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={currentStatus === 'Absent' ? 'destructive' : 'outline'}
                          onClick={() => handleStatusChange(student, 'Absent')}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={currentStatus === 'Late' ? 'secondary' : 'outline'}
                          onClick={() => handleStatusChange(student, 'Late')}
                        >
                          Late
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : !isPending && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
