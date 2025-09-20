
'use client';

import type { Student, Teacher, AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { SetPasswordDialog } from './set-password-dialog';
import { ResultsManagement } from './results-management';
import { AttendanceManagement } from './attendance/attendance-management';
import { useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeacherDashboardProps {
  teacher: Teacher;
  students: Student[];
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
}

export function TeacherDashboard({ teacher, students, attendance, forcePasswordReset }: TeacherDashboardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const attendancePercentage = useMemo(() => {
    if (attendance.length === 0) return 'N/A';
    const presentDays = attendance.filter(a => a.status === 'present').length;
    return `${((presentDays / attendance.length) * 100).toFixed(2)}%`;
  }, [attendance]);

  const getAttendanceStatusIcon = (status: 'present' | 'absent') => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <>
      <SetPasswordDialog isOpen={forcePasswordReset} teacherId={teacher.id} />
      <div id="teacher-dashboard" className="bg-[rgb(231,249,254)]">
          <Card className="min-h-screen">
            <CardHeader className="relative flex items-center justify-between p-4 md:p-6 print-hidden">
              <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 border">
                  <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
                  <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <CardTitle className="text-xl md:text-2xl">{teacher.name}</CardTitle>
                      <CardDescription>Welcome to your teacher portal.</CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-nowrap">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="results">Manage Results</TabsTrigger>
                  <TabsTrigger value="attendance">Manage Student Attendance</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                              <Table className="table-fixed w-full">
                                  <TableBody>
                                      <TableRow>
                                          <TableCell className="font-medium w-1/3 md:w-1/4">Name</TableCell>
                                          <TableCell className="break-words">{teacher.name}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                          <TableCell className="font-medium">Email</TableCell>
                                          <TableCell className="whitespace-normal break-words">{teacher.email}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                          <TableCell className="font-medium">Subject</TableCell>
                                          <TableCell>{teacher.subject}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                          <TableCell className="font-medium">Phone</TableCell>
                                          <TableCell className="whitespace-normal break-words">{teacher.phone}</TableCell>
                                      </TableRow>
                                  </TableBody>
                              </Table>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <div className='flex flex-col md:flex-row items-center justify-between'>
                          <div>
                            <CardTitle>My Attendance History</CardTitle>
                            <CardDescription>Your attendance record for the current session.</CardDescription>
                          </div>
                          <Badge className="mt-2 md:mt-0">Overall: {attendancePercentage}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='overflow-auto max-h-96'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {attendance.length > 0 ? (
                                attendance.map((record) => (
                                  <TableRow key={record.date}>
                                    <TableCell>{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                      {getAttendanceStatusIcon(record.status)}
                                      <span className="capitalize">{record.status}</span>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center">
                                    No attendance records found.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="results" className="mt-4">
                    <ResultsManagement students={students} />
                </TabsContent>
                 <TabsContent value="attendance" className="mt-4">
                    <AttendanceManagement students={students} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
