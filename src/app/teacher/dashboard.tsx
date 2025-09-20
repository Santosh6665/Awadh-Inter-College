
'use client';

import type { Student, Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { SetPasswordDialog } from './set-password-dialog';
import { ResultsManagement } from './results-management';

interface TeacherDashboardProps {
  teacher: Teacher;
  students: Student[];
  forcePasswordReset: boolean;
}

export function TeacherDashboard({ teacher, students, forcePasswordReset }: TeacherDashboardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
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
                </TabsList>
                <TabsContent value="profile" className="mt-4">
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
                </TabsContent>
                 <TabsContent value="results" className="mt-4">
                    <ResultsManagement students={students} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
