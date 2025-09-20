
'use client';

import type { Student, AttendanceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import Link from 'next/link';
import { SetPasswordDialog } from './set-password-dialog';
import { calculatePercentage, calculateGrade } from '@/lib/result-utils';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

interface StudentDashboardProps {
  student: Student;
  rank: number | null;
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
}

export function StudentDashboard({ student, rank, attendance, forcePasswordReset }: StudentDashboardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const percentage = calculatePercentage(student.marks);
  const grade = calculateGrade(percentage);

  const hasMarks = student.marks && Object.values(student.marks).some(mark => mark !== null && mark !== undefined);

  const handlePrint = () => {
    window.print();
  };
  
  const attendancePercentage = useMemo(() => {
    if (attendance.length === 0) return 'N/A';
    const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return `${((presentDays / attendance.length) * 100).toFixed(2)}%`;
  }, [attendance]);

  const getAttendanceStatusIcon = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };


  return (
    <>
      <SetPasswordDialog isOpen={forcePasswordReset} studentId={student.id} />
      <div className="container mx-auto p-4 md:p-8" id="student-dashboard">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 print-hidden">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={student.photoUrl} alt={student.name} />
                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription>Roll No: {student.rollNumber} | Class: {student.class}-{student.section}</CardDescription>
              </div>
            </div>
            <form action="/student/logout" method="GET">
              <Button asChild variant="outline">
                  <Link href="/student/logout">Log Out</Link>
              </Button>
            </form>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="print-hidden">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="results">Exam Results</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fee Information</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableBody>
                                  <TableRow>
                                      <TableCell className="font-medium">Email</TableCell>
                                      <TableCell>{student.email}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                      <TableCell className="font-medium">Phone</TableCell>
                                      <TableCell>{student.phone}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                      <TableCell className="font-medium">Date of Birth</TableCell>
                                      <TableCell>{student.dob}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                      <TableCell className="font-medium">Father's Name</TableCell>
                                      <TableCell>{student.fatherName}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                      <TableCell className="font-medium">Address</TableCell>
                                      <TableCell>{student.address}</TableCell>
                                  </TableRow>
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </TabsContent>
               <TabsContent value="results" className="mt-4">
                  <Card id="result-card">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                           <div className="text-center md:text-left">
                                <CardTitle>Examination Results</CardTitle>
                                <CardDescription>Awadh Inter College - Session 2024-2025</CardDescription>
                           </div>
                           <Button onClick={handlePrint} variant="outline" size="sm" className="print-hidden">
                                <Download className="mr-2 h-4 w-4" />
                                Download Result
                           </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                          {hasMarks ? (
                              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4">
                                    <div><strong>Student Name:</strong> {student.name}</div>
                                    <div><strong>Roll Number:</strong> {student.rollNumber}</div>
                                    <div><strong>Class:</strong> {`${student.class}-${student.section}`}</div>
                                    <div><strong>Father's Name:</strong> {student.fatherName}</div>
                                  </div>
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                              <TableHead>Subject</TableHead>
                                              <TableHead className="text-right">Marks (out of 100)</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          <TableRow>
                                              <TableCell>Physics</TableCell>
                                              <TableCell className="text-right">{student.marks?.physics ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>Chemistry</TableCell>
                                              <TableCell className="text-right">{student.marks?.chemistry ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>Maths</TableCell>
                                              <TableCell className="text-right">{student.marks?.maths ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>English</TableCell>
                                              <TableCell className="text-right">{student.marks?.english ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>Computer Science</TableCell>
                                              <TableCell className="text-right">{student.marks?.computerScience ?? 'N/A'}</TableCell>
                                          </TableRow>
                                      </TableBody>
                                  </Table>
                                  <div className="flex justify-end gap-8 font-bold pr-4">
                                      <span>Percentage: {percentage?.toFixed(2)}%</span>
                                      <span>Grade: {grade}</span>
                                      <span>Rank: {rank ?? 'N/A'}</span>
                                  </div>
                              </div>
                          ) : (
                            <p className="text-muted-foreground">No exam results available at the moment.</p>
                          )}
                      </CardContent>
                  </Card>
              </TabsContent>
               <TabsContent value="attendance" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className='flex flex-col md:flex-row items-center justify-between'>
                      <div>
                        <CardTitle>Attendance Record</CardTitle>
                        <CardDescription>Your attendance history for the current session.</CardDescription>
                      </div>
                      <Badge className="mt-2 md:mt-0">Overall: {attendancePercentage}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="fees" className="mt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Fee Payment Details</CardTitle>
                          <CardDescription>Status of your fee payments.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">No fee information available at the moment.</p>
                      </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
