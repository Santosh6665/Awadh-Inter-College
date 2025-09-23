
'use client';

import type { Student, Teacher, AttendanceRecord, SalaryPayment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { SetPasswordDialog } from './set-password-dialog';
import { ResultsManagement } from './results-management';
import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalarySlip } from '../admin/dashboard/salary/salary-slip';
import { AttendanceHistory } from '../student/attendance-history';
import { AttendanceManagement } from './attendance/attendance-management';

interface TeacherDashboardProps {
  teacher: Teacher;
  students: Student[];
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
  settings: any;
}

export function TeacherDashboard({ teacher, students, attendance, forcePasswordReset, settings }: TeacherDashboardProps) {
  const [slipToPrint, setSlipToPrint] = useState<SalaryPayment | null>(null);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const totalSalaryPaid = useMemo(() => {
    return (teacher.salaryPayments || []).reduce((acc, p) => acc + p.amount, 0);
  }, [teacher.salaryPayments]);

  
  const handlePrintSlip = (payment: SalaryPayment) => {
    setSlipToPrint(payment);
    setTimeout(() => {
        document.body.classList.add('print-salary-slip');
        window.print();
        document.body.classList.remove('print-salary-slip');
        setSlipToPrint(null);
    }, 100);
  };

  return (
    <>
      <SetPasswordDialog isOpen={forcePasswordReset} teacherId={teacher.id} />
       {slipToPrint && (
        <div id="slip-to-print" className="hidden print-block">
          <SalarySlip teacher={teacher} payment={slipToPrint} />
        </div>
      )}
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
                </CardHeader>
                <CardContent className="pt-0 p-4 md:p-6">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-nowrap">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="attendance">Student Attendance</TabsTrigger>
                        <TabsTrigger value="results">Manage Results</TabsTrigger>
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Salary Information</CardTitle>
                                <CardDescription>Your salary and payment history.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="p-4">
                                        <CardTitle className="text-sm text-muted-foreground">Base Salary (Monthly)</CardTitle>
                                        <p className="text-2xl font-bold">Rs{(teacher.baseSalary || 0).toFixed(2)}</p>
                                    </Card>
                                    <Card className="p-4">
                                        <CardTitle className="text-sm text-muted-foreground">Total Paid (All Time)</CardTitle>
                                        <p className="text-2xl font-bold text-green-600">Rs{totalSalaryPaid.toFixed(2)}</p>
                                    </Card>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                                    <div className="overflow-auto max-h-96">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Month</TableHead>
                                                <TableHead className="text-right">Amount (Rs)</TableHead>
                                                <TableHead className="text-right print-hidden">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {teacher.salaryPayments && teacher.salaryPayments.length > 0 ? (
                                            teacher.salaryPayments.map(payment => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</TableCell>
                                                    <TableCell>{payment.method}</TableCell>
                                                    <TableCell>{payment.month || 'N/A'}</TableCell>
                                                    <TableCell className="text-right">Rs{payment.amount.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right print-hidden">
                                                        <Button variant="outline" size="sm" onClick={() => handlePrintSlip(payment)}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Slip
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">No salary payments recorded yet.</TableCell>
                                            </TableRow>
                                        )}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow className="font-bold text-base bg-muted/50">
                                                <TableCell colSpan={3}>Total Paid</TableCell>
                                                <TableCell className="text-right">Rs{totalSalaryPaid.toFixed(2)}</TableCell>
                                                <TableCell className="print-hidden"></TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <AttendanceHistory attendanceRecords={attendance} />
                    </TabsContent>
                    <TabsContent value="attendance" className="mt-6">
                       <AttendanceManagement students={students} teacher={teacher} />
                    </TabsContent>
                    <TabsContent value="results" className="mt-6">
                        <ResultsManagement students={students} teacher={teacher} settings={settings} />
                    </TabsContent>
                </Tabs>
                </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
}
