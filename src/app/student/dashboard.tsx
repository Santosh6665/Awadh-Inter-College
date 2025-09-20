
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
import { Separator } from '@/components/ui/separator';
import { CollegeLogo } from '@/components/icons';

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
  const resultStatus = grade === 'F' ? 'Fail' : 'Pass';

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
                                      <TableCell>{new Date(student.dob).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</TableCell>
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
                  <Card id="result-card" className="border-2">
                      <CardHeader className="p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                           <div className="text-center md:text-left flex-1">
                                <div className="flex items-center gap-4 justify-center md:justify-start">
                                    <CollegeLogo className="h-12 w-12 text-primary" />
                                    <div>
                                        <CardTitle className="text-xl md:text-2xl">Awadh Inter College</CardTitle>
                                        <CardDescription>Annual Examination Marksheet (2024-2025)</CardDescription>
                                    </div>
                                </div>
                           </div>
                           <Button onClick={handlePrint} variant="outline" size="sm" className="print-hidden">
                                <Download className="mr-2 h-4 w-4" />
                                Download Result
                           </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                          {hasMarks ? (
                              <div className="space-y-4">
                                  <Separator />
                                  <h3 className="font-semibold text-center md:text-left mt-4">Student Details</h3>
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div><strong>Student Name:</strong> {student.name}</div>
                                    <div><strong>Roll Number:</strong> {student.rollNumber}</div>
                                    <div><strong>Class:</strong> {`${student.class}-${student.section}`}</div>
                                    <div><strong>Father's Name:</strong> {student.fatherName}</div>
                                  </div>
                                  <Separator className="my-4"/>
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                              <TableHead className='font-bold'>Subject</TableHead>
                                              <TableHead className='font-bold'>Total Marks</TableHead>
                                              <TableHead className="text-right font-bold">Marks Obtained</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          <TableRow>
                                              <TableCell>Physics</TableCell>
                                              <TableCell>100</TableCell>
                                              <TableCell className="text-right">{student.marks?.physics ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>Chemistry</TableCell>
                                              <TableCell>100</TableCell>
                                              <TableCell className="text-right">{student.marks?.chemistry ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>Maths</TableCell>
                                              <TableCell>100</TableCell>
                                              <TableCell className="text-right">{student.marks?.maths ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>English</TableCell>
                                              <TableCell>100</TableCell>
                                              <TableCell className="text-right">{student.marks?.english ?? 'N/A'}</TableCell>
                                          </TableRow>
                                           <TableRow>
                                              <TableCell>Computer Science</TableCell>
                                              <TableCell>100</TableCell>
                                              <TableCell className="text-right">{student.marks?.computerScience ?? 'N/A'}</TableCell>
                                          </TableRow>
                                      </TableBody>
                                  </Table>
                                  <Separator className="my-4"/>
                                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-bold p-4 bg-muted rounded-lg">
                                      <div className='text-center md:text-left'>
                                        <span>Percentage: </span>
                                        <span className='text-primary'>{percentage?.toFixed(2)}%</span>
                                      </div>
                                      <div className='text-center md:text-left'>
                                        <span>Grade: </span>
                                        <span className='text-primary'>{grade}</span>
                                      </div>
                                       <div className='text-center md:text-left'>
                                        <span>Rank: </span>
                                        <span className='text-primary'>{rank ?? 'N/A'}</span>
                                      </div>
                                      <div className='text-center md:text-left'>
                                        <span>Result: </span>
                                        <Badge variant={resultStatus === 'Pass' ? 'default' : 'destructive'} className='bg-green-500 text-white'>{resultStatus}</Badge>
                                      </div>
                                  </div>
                              </div>
                          ) : (
                            <p className="text-muted-foreground text-center py-8">No exam results are available at the moment.</p>
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
