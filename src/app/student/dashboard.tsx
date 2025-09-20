
'use client';

import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import Link from 'next/link';
import { SetPasswordDialog } from './set-password-dialog';
import { calculatePercentage, calculateGrade } from '@/lib/result-utils';

interface StudentDashboardProps {
  student: Student;
  forcePasswordReset: boolean;
}

export function StudentDashboard({ student, forcePasswordReset }: StudentDashboardProps) {
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

  return (
    <>
      <SetPasswordDialog isOpen={forcePasswordReset} studentId={student.id} />
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
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
            <Tabs defaultValue="profile" className="w-full">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="fees">Fee Information</TabsTrigger>
                <TabsTrigger value="results">Exam Results</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
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
              <TabsContent value="results" className="mt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Examination Results</CardTitle>
                          <CardDescription>Your performance in recent exams.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {hasMarks ? (
                              <div className="space-y-4">
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
                          <CardTitle>Attendance Record</CardTitle>
                          <CardDescription>Your monthly attendance summary.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground">No attendance records available at the moment.</p>
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
