
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Teacher, AttendanceRecord } from '@/lib/types';
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
import { Calendar as CalendarIcon, Search, Eye, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { getTeacherAttendanceByDate, setTeacherAttendance as setTeacherAttendanceAction, getTeacherAttendanceHistory, clearTeacherAttendance as clearTeacherAttendanceAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { AttendanceHistoryDialog } from '../attendance/attendance-history-dialog';


type AttendanceStatus = 'present' | 'absent';
type AttendanceData = {
  [teacherId: string]: { status: AttendanceStatus };
};

export function TeacherAttendanceManagement({ teachers }: { teachers: Teacher[] }) {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const { toast } = useToast();
  
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherHistory, setTeacherHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const formattedDate = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getTeacherAttendanceByDate(formattedDate);
        setAttendance(data || {});
    } catch (error) {
        console.error("Failed to fetch attendance:", error);
        toast({
            title: 'Error',
            description: 'Could not fetch teacher attendance data.',
            variant: 'destructive',
        });
        setAttendance({}); // Reset to empty on error
    } finally {
        setLoading(false);
    }
  }, [formattedDate, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleStatusChange = async (teacherId: string, status: AttendanceStatus) => {
    // Optimistic UI update
    setAttendance(prev => ({ ...prev, [teacherId]: { status } }));
    
    const result = await setTeacherAttendanceAction(teacherId, formattedDate, status);
    
    if (result.success) {
      // Re-fetch on success to ensure data consistency
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
  
  const handleClearAttendance = async (teacherId: string) => {
    const currentAttendance = { ...attendance };
    // Optimistic UI update
    setAttendance(prev => {
        const newState = { ...prev };
        delete newState[teacherId];
        return newState;
    });

    const result = await clearTeacherAttendanceAction(teacherId, formattedDate);

    if (!result.success) {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
      // Revert UI on failure
      setAttendance(currentAttendance);
    }
  };

  const handleViewHistory = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setHistoryLoading(true);
    setIsHistoryDialogOpen(true);
    const history = await getTeacherAttendanceHistory(teacher.id);
    setTeacherHistory(history);
    setHistoryLoading(false);
  };


  const filteredTeachers = useMemo(() => teachers.filter(teacher => {
    const nameMatch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = subjectFilter ? teacher.subject.toLowerCase().includes(subjectFilter.toLowerCase()) : true;
    return nameMatch && subjectMatch;
  }), [teachers, searchQuery, subjectFilter]);
  
  const attendanceSummary = useMemo(() => {
    const teacherIdsInFilter = new Set(filteredTeachers.map(t => t.id));
    const attendanceValues = Object.entries(attendance || {})
      .filter(([teacherId]) => teacherIdsInFilter.has(teacherId))
      .map(([, data]) => data);
      
    const present = attendanceValues.filter(a => a?.status === 'present').length;
    const absent = attendanceValues.filter(a => a?.status === 'absent').length;
    const total = filteredTeachers.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, percentage };
  }, [attendance, filteredTeachers]);


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Teacher Attendance Management</CardTitle>
                <CardDescription>Mark and track teacher attendance for the selected date.</CardDescription>
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
              placeholder="Filter by subject..."
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full"
          />
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Summary for filtered teachers:</strong> Present: {attendanceSummary.present} | Absent: {attendanceSummary.absent} | 
          <strong> Attendance: {attendanceSummary.percentage.toFixed(2)}%</strong>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading attendance...</TableCell>
                </TableRow>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => {
                  const status = attendance[teacher.id]?.status;
                  return (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2 md:gap-4">
                            <RadioGroup
                            onValueChange={(value) => handleStatusChange(teacher.id, value as AttendanceStatus)}
                            value={status}
                            className="flex items-center gap-2 md:gap-4"
                            >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="present" id={`present-${teacher.id}`} />
                                <Label htmlFor={`present-${teacher.id}`}>Present</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="absent" id={`absent-${teacher.id}`} />
                                <Label htmlFor={`absent-${teacher.id}`}>Absent</Label>
                            </div>
                            </RadioGroup>
                            {status && (
                            <Button variant="ghost" size="icon" title="Clear Attendance" onClick={() => handleClearAttendance(teacher.id)}>
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="View Attendance History" onClick={() => handleViewHistory(teacher)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No teachers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
      <AttendanceHistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        personName={selectedTeacher?.name ?? null}
        attendanceRecords={historyLoading ? [] : teacherHistory}
      />
    </>
  );
}
