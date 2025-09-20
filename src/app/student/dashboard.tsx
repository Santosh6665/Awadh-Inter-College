
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import Link from 'next/link';

interface StudentDashboardProps {
  student: Student;
}

export function StudentDashboard({ student }: StudentDashboardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  return (
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
                        <p className="text-muted-foreground">No exam results available at the moment.</p>
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
  );
}
