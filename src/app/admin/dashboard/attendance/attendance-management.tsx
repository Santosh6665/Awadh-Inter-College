
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { getAttendanceByDate, setAttendance as setAttendanceAction } from './actions';
import { useToast } from '@/hooks/use-toast';

type AttendanceStatus = 'present' | 'absent' | 'late';
type AttendanceData = {
  [studentId: string]: { status: AttendanceStatus };
};

export function AttendanceManagement({ students }: { students: Student[] }) {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const { toast } = useToast();

  const formattedDate = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getAttendanceByDate(formattedDate);
        setAttendance(data || {});
    } catch (error) {
        console.error("Failed to fetch attendance:", error);
        toast({
            title: 'Error',
            description: 'Could not fetch attendance data.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }, [formattedDate, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    // Optimistic UI update
    setAttendance(prev => ({ ...prev, [studentId]: { status } }));
    
    const result = await setAttendanceAction(studentId, formattedDate, status);
    
    if (result.success) {
      // Re-fetch on success to ensure data consistency, though optimistic update handles the immediate UI change.
      // This is useful if the backend modifies the data in some way.
      await fetchAttendance();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
      // Revert if API call fails by re-fetching the original state
      await fetchAttendance();
    }
  };

  const filteredStudents = useMemo(() => students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class.toLowerCase().includes(classFilter.toLowerCase()) : true;
    return nameMatch && classMatch;
  }), [students, searchQuery, classFilter]);
  
  const attendanceSummary = useMemo(() => {
    const studentIdsInFilter = new Set(filteredStudents.map(s => s.id));
    const attendanceValues = Object.entries(attendance || {})
      .filter(([studentId]) => studentIdsInFilter.has(studentId))
      .map(([, data]) => data);
      
    const present = attendanceValues.filter(a => a?.status === 'present').length;
    const absent = attendanceValues.filter(a => a?.status === 'absent').length;
    const late = attendanceValues.filter(a => a?.status === 'late').length;
    const total = filteredStudents.length;
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;
    return { present, absent, late, percentage };
  }, [attendance, filteredStudents]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Attendance Management</CardTitle>
                <CardDescription>Mark and track student attendance for the selected date.</CardDescription>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => day && setDate(day)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
        </div>
        <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
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
              className="w-full"
          />
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Summary for filtered students:</strong> Present: {attendanceSummary.present} | Absent: {attendanceSummary.absent} | Late: {attendanceSummary.late} | 
          <strong> Attendance: {attendanceSummary.percentage.toFixed(2)}%</strong>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading attendance...</TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = attendance[student.id]?.status;
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="hidden md:table-cell">{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{`${student.class}-${student.section}`}</TableCell>
                      <TableCell className="text-right">
                        <RadioGroup
                          onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                          value={status}
                          className="flex justify-end gap-2 md:gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="present" id={`present-${student.id}`} />
                            <Label htmlFor={`present-${student.id}`}>Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                            <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="late" id={`late-${student.id}`} />
                            <Label htmlFor={`late-${student.id}`}>Late</Label>
                          </div>
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
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
