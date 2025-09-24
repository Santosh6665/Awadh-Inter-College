
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
import { Calendar as CalendarIcon, Search, Eye, XCircle, Tent, DoorClosed, Lock } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { getAttendanceByDate, setAttendance, getStudentAttendanceHistory, clearAttendance, isHoliday, getSchoolStatus } from './actions';
import { useToast } from '@/hooks/use-toast';
import { AttendanceHistoryDialog } from '@/app/admin/dashboard/attendance/attendance-history-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHolidays } from '@/app/admin/dashboard/notices/actions';

type AttendanceStatus = 'present' | 'absent';
type AttendanceData = {
  [studentId: string]: { status: AttendanceStatus };
};

export function AttendanceManagement({ students, teacher }: { students: Student[], teacher: Teacher }) {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const { toast } = useToast();

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentHistory, setStudentHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [isDateHoliday, setIsDateHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('');
  const [holidays, setHolidays] = useState<string[]>([]);
  
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
        setAttendance({});
    } finally {
        setLoading(false);
    }
  }, [formattedDate, toast]);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        await checkDateStatus();
        await fetchAttendance();
        getHolidays().then(setHolidays);
        setLoading(false);
    }
    loadData();
  }, [checkDateStatus, fetchAttendance]);

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    const originalAttendance = { ...attendance };
    setAttendance(prev => ({ ...prev, [studentId]: { status } }));
    
    const result = await setAttendance(studentId, formattedDate, status);
    
    if (!result.success) {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
      setAttendance(originalAttendance);
    }
  };

  const handleClearAttendance = async (studentId: string) => {
    const originalAttendance = { ...attendance };
    setAttendance(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
    });

    const result = await clearAttendance(studentId, formattedDate);

    if (!result.success) {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
      setAttendance(originalAttendance);
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
    const classMatch = classFilter ? student.class === classFilter : true;
    const sectionMatch = sectionFilter ? student.section === sectionFilter : true;
    return nameMatch && classMatch && sectionMatch;
  }).sort((a, b) => a.name.localeCompare(b.name)), [students, searchQuery, classFilter, sectionFilter]);

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

  const isReadOnly = !canEditAttendance || isDateHoliday || isSchoolClosed;

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>View and mark student attendance for the selected date.</CardDescription>
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
            <Select value={classFilter} onValueChange={(value) => setClassFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by class..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {[...new Set(students.map(s => s.class))].sort().map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={(value) => setSectionFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by section..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {[...new Set(students.map(s => s.section))].sort().map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Summary for filtered students:</strong> Present: {attendanceSummary.present} | Absent: {attendanceSummary.absent} | 
          <strong> Attendance: {attendanceSummary.percentage.toFixed(2)}%</strong>
        </div>
      </CardHeader>
      <CardContent>
        {!canEditAttendance && (
            <Alert variant="destructive" className="mb-4">
                <Lock className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                You do not have permission to edit student attendance. This view is read-only.
                </AlertDescription>
            </Alert>
        )}
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
                          <div className="flex items-center justify-end gap-2 md:gap-4">
                              <RadioGroup
                              onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                              value={status}
                              className="flex items-center gap-2 md:gap-4"
                              disabled={isReadOnly}
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
                               {status && (
                                  <Button variant="ghost" size="icon" title="Clear Attendance" onClick={() => handleClearAttendance(student.id)} disabled={isReadOnly}>
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                               )}
                          </div>
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
        holidays={holidays}
      />
    </>
  );
}
