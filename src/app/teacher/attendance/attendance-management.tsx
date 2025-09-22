
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Student, AttendanceRecord, Teacher } from '@/lib/types';
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
import { Calendar as CalendarIcon, Search, Eye, Tent, DoorClosed } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { getAttendanceByDate, setAttendance as setAttendanceAction, getStudentAttendanceHistory } from './actions';
import { useToast } from '@/hooks/use-toast';
import { AttendanceHistoryDialog } from '@/app/admin/dashboard/attendance/attendance-history-dialog';
import { isHoliday, getSchoolStatus } from '@/app/admin/dashboard/teacher-attendance/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AttendanceStatus = 'present' | 'absent';
type AttendanceData = {
  [studentId: string]: { status: AttendanceStatus };
};

interface AttendanceManagementProps {
  students: Student[];
  teacher: Teacher;
}

export function AttendanceManagement({ students, teacher }: AttendanceManagementProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const { toast } = useToast();

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentHistory, setStudentHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [isDateHoliday, setIsDateHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('');

  const canEditAttendance = teacher?.canEditAttendance ?? false;
  const formattedDate = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

  const checkDateStatus = useCallback(async () => {
    setLoading(true);
    const holidayStatus = await isHoliday(formattedDate);
    setIsDateHoliday(holidayStatus.isHoliday);
    setHolidayName(holidayStatus.name || 'Holiday');

    if (!holidayStatus.isHoliday) {
        const schoolStatus = await getSchoolStatus(formattedDate);
        setIsSchoolClosed(schoolStatus.isClosed);
        setClosedReason(schoolStatus.reason || 'School is closed');
    } else {
        setIsSchoolClosed(false);
    }
  }, [formattedDate]);

  const fetchAttendance = useCallback(async () => {
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
        setAttendance({}); // Reset to empty on error
    } finally {
        setLoading(false);
    }
  }, [formattedDate, toast]);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        await checkDateStatus();
        await fetchAttendance();
        setLoading(false);
    }
    loadData();
  }, [checkDateStatus, fetchAttendance]);


  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    if (!canEditAttendance) {
        toast({
            title: 'Permission Denied',
            description: "You do not have permission to edit attendance.",
            variant: 'destructive'
        });
        return;
    }

    // Optimistic UI update
    setAttendance(prev => ({ ...prev, [studentId]: { status } }));
    
    const result = await setAttendanceAction(studentId, formattedDate, status);
    
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
  
  const handleViewHistory = async (student: Student) => {
    setSelectedStudent(student);
    setHistoryLoading(true);
    setIsHistoryDialogOpen(true);
    const history = await getStudentAttendanceHistory(student.id);
    setStudentHistory(history);
    setHistoryLoading(false);
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
    const total = filteredStudents.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, percentage };
  }, [attendance, filteredStudents]);


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Attendance Management</CardTitle>
                <CardDescription>
                    {canEditAttendance 
                        ? "Mark and track student attendance for the selected date."
                        : "View student attendance. You do not have permission to make changes."
                    }
                </CardDescription>
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
          <strong>Summary for filtered students:</strong> Present: {attendanceSummary.present} | Absent: {attendanceSummary.absent} | 
          <strong> Attendance: {attendanceSummary.percentage.toFixed(2)}%</strong>
        </div>
      </CardHeader>
      <CardContent>
        {isDateHoliday ? (
          <Alert>
            <Tent className="h-4 w-4" />
            <AlertTitle>{holidayName}</AlertTitle>
            <AlertDescription>
              The selected date is marked as a holiday. Attendance cannot be recorded.
            </AlertDescription>
          </Alert>
        ) : isSchoolClosed ? (
          <Alert variant="destructive">
            <DoorClosed className="h-4 w-4" />
            <AlertTitle>School is Closed</AlertTitle>
            <AlertDescription>
              {closedReason} Attendance cannot be recorded.
            </AlertDescription>
          </Alert>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right w-1/3">Status</TableHead>
                <TableHead className="text-right">History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading attendance...</TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = attendance[student.id]?.status;
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{`${student.class}-${student.section}`}</TableCell>
                      <TableCell className="text-right">
                        <RadioGroup
                          onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                          value={status}
                          className="flex justify-end gap-2 md:gap-4"
                          disabled={!canEditAttendance}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="present" id={`present-${student.id}`} />
                            <Label htmlFor={`present-${student.id}`}>Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                            <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                          </div>
                        </RadioGroup>
                      </TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="View Attendance History" onClick={() => handleViewHistory(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
     <AttendanceHistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        personName={selectedStudent?.name ?? null}
        attendanceRecords={historyLoading ? [] : studentHistory}
      />
    </>
  );
}
