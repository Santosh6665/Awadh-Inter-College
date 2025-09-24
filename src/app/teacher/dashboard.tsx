
'use client';

import type { Student, Teacher, AttendanceRecord, SalaryPayment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SetPasswordDialog } from './set-password-dialog';
import { ResultsManagement } from './results-management';
import { useMemo, useState } from 'react';
import { AttendanceHistory } from '../student/attendance-history';
import { AttendanceManagement } from './attendance/attendance-management';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { SalaryView } from './salary-view';

interface TeacherDashboardProps {
  teacher: Teacher;
  students: Student[];
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
  settings: any;
}

export function TeacherDashboard({ teacher, students, attendance, forcePasswordReset, settings }: TeacherDashboardProps) {
  const [selectedSession, setSelectedSession] = useState(settings.activeSession || '');
  const sessions = settings?.sessions || [];
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const studentsInSession = useMemo(() => {
    return students.filter(student => student.session === selectedSession);
  }, [students, selectedSession]);

  return (
    <>
      <SetPasswordDialog isOpen={forcePasswordReset} teacherId={teacher.id} />
      <div id="teacher-dashboard" className="bg-muted/50">
          <div className="container mx-auto py-8">
            <Card className="min-h-screen">
                <CardHeader className="relative flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 print-hidden gap-4">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
                        <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
                        <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-2xl md:text-3xl">{teacher.name}</CardTitle>
                        <CardDescription className="text-base">Welcome to your teacher portal.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Viewing Session:</span>
                        <Select value={selectedSession} onValueChange={setSelectedSession}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent>
                                {sessions.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 p-4 md:p-6">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-nowrap">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="attendance">Student Attendance</TabsTrigger>
                        <TabsTrigger value="results">Manage Results</TabsTrigger>
                        <TabsTrigger value="salary">Salary Slip</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium w-1/3 md:w-1/4">Name</TableCell>
                                            <TableCell>{teacher.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Employee ID</TableCell>
                                            <TableCell>{teacher.employeeId || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Email</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Department/Subject</TableCell>
                                            <TableCell>{teacher.subject}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Phone</TableCell>
                                            <TableCell>{teacher.phone}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Date of Birth</TableCell>
                                            <TableCell>{teacher.dob ? new Date(teacher.dob).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
                                        </TableRow>
                                         <TableRow>
                                            <TableCell className="font-medium">Date of Joining</TableCell>
                                            <TableCell>{teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Qualification</TableCell>
                                            <TableCell>{teacher.qualification || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">PAN/Aadhar No.</TableCell>
                                            <TableCell>{teacher.panOrAadharNumber || 'N/A'}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>
                        <AttendanceHistory attendanceRecords={attendance} />
                    </TabsContent>
                    <TabsContent value="attendance" className="mt-6">
                       <AttendanceManagement students={studentsInSession} teacher={teacher} />
                    </TabsContent>
                    <TabsContent value="results" className="mt-6">
                        <ResultsManagement students={studentsInSession} teacher={teacher} settings={settings} />
                    </TabsContent>
                     <TabsContent value="salary" className="mt-6">
                        <SalaryView teacher={teacher} />
                    </TabsContent>
                </Tabs>
                </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
}
