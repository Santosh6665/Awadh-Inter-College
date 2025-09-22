
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, Payment, ExamTypes, Marks } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { SetPasswordDialog } from './set-password-dialog';
import { Download, CheckCircle, XCircle, GraduationCap, User, BookOpen, BarChart3, Mail, Phone, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { FeeReceipt } from './fee-receipt';
import { AttendanceHistory } from './attendance-history';
import { ResultCard } from './result-card';


interface StudentDashboardProps {
  student: Student;
  ranks: { [key in ExamTypes]?: number | null };
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
  settings: any;
}

export function StudentDashboard({ student, ranks, attendance, forcePasswordReset, settings }: StudentDashboardProps) {
  const [receiptToPrint, setReceiptToPrint] = useState<Payment | null>(null);
  
  const feeSettings = settings?.feeStructure || {};

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  const handlePrintReceipt = (payment: Payment) => {
    setReceiptToPrint(payment);
    setTimeout(() => {
        document.body.classList.add('print-fee-receipt');
        window.print();
        document.body.classList.remove('print-fee-receipt');
        setReceiptToPrint(null);
    }, 100);
  };

  const feeDetails = useMemo(() => {
    const classFeeStructure = feeSettings[student.class] || {};
    const studentFeeOverrides = student.feeStructure || {};
    const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

    const feeHeads = [
      { key: 'tuition', label: 'Tuition Fee' },
      { key: 'transport', label: 'Transport Fee' },
      { key: 'exam', label: 'Exam Fee' },
      { key: 'computer', label: 'Computer Fee' },
      { key: 'miscellaneous', label: 'Miscellaneous' },
    ];
    
    const structuredFees = feeHeads
      .map(head => ({
        head: head.label,
        amount: finalFeeStructure[head.key] || 0,
      }))
      .filter(fee => fee.amount > 0);

    const discount = finalFeeStructure.discount || 0;
    if (discount > 0) {
      structuredFees.push({ head: 'Discount/Concession', amount: -discount });
    }

    const totalFees = structuredFees.reduce((acc, fee) => acc + fee.amount, 0);
    const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const due = totalFees - totalPaid;
    const paymentPlan = finalFeeStructure.paymentPlan || 'Not set';

    return { structuredFees, totalFees, totalPaid, due, paymentPlan };
  }, [student, feeSettings]);

  return (
    <>
      <SetPasswordDialog isOpen={forcePasswordReset} studentId={student.id} />
       <div id="fee-receipt-to-print" className="hidden print-block">
          {receiptToPrint && (
            <FeeReceipt student={student} payment={receiptToPrint} feeDetails={feeDetails} />
          )}
       </div>
      <div id="student-dashboard" className="bg-muted/50">
        <div className="container mx-auto py-8">
            <Card className="min-h-screen">
            <CardHeader className="relative flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 print-hidden gap-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
                    <AvatarImage src={student.photoUrl} alt={student.name} />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl">{student.name}</CardTitle>
                <CardDescription className="text-base">Welcome to your student portal.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-0 p-4 md:p-6">
                <Tabs defaultValue="profile" className="w-full">
                <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-nowrap">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="results">Exam Results</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="fees">Fee Information</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-6">
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
                                            <TableCell>{student.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Roll Number</TableCell>
                                            <TableCell>{student.rollNumber}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Class</TableCell>
                                            <TableCell>{`${student.class}-${student.section}`}</TableCell>
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
                                        <TableRow>
                                            <TableCell className="font-medium">Phone</TableCell>
                                            <TableCell>{student.phone}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Email</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="results" className="mt-6">
                    <ResultCard student={student} ranks={ranks} settings={settings} />
                </TabsContent>
                <TabsContent value="attendance" className="mt-6">
                   <AttendanceHistory attendanceRecords={attendance} />
                </TabsContent>
                <TabsContent value="fees" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Payment Details</CardTitle>
                            <CardDescription>A summary of your fee structure and payment history.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Fee Structure</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fee Head</TableHead>
                                            <TableHead className="text-right">Amount (Rs)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {feeDetails.structuredFees.map((fee, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{fee.head}</TableCell>
                                                <TableCell className={cn("text-right", fee.amount < 0 && 'text-green-600')}>Rs{fee.amount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="font-bold text-base">
                                            <TableCell>Total Fees</TableCell>
                                            <TableCell className="text-right">Rs{feeDetails.totalFees.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                <Card className="p-4">
                                    <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
                                    <p className="text-xl md:text-2xl font-bold">Rs{feeDetails.totalFees.toFixed(2)}</p>
                                </Card>
                                <Card className="p-4">
                                    <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
                                    <p className="text-xl md:text-2xl font-bold text-green-600">Rs{feeDetails.totalPaid.toFixed(2)}</p>
                                </Card>
                                <Card className="p-4">
                                    <CardTitle className="text-sm text-muted-foreground">Balance Due</CardTitle>
                                    <p className={cn("text-xl md:text-2xl font-bold", feeDetails.due > 0 ? 'text-destructive' : 'text-green-600')}>Rs{feeDetails.due.toFixed(2)}</p>
                                </Card>
                                <Card className="p-4">
                                    <CardTitle className="text-sm text-muted-foreground">Payment Plan</CardTitle>
                                    <p className="text-xl md:text-2xl font-bold capitalize">{feeDetails.paymentPlan}</p>
                                </Card>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="hidden sm:table-cell">Method</TableHead>
                                            <TableHead className="text-right">Amount (Rs)</TableHead>
                                            <TableHead className="text-right print-hidden">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {student.payments && student.payments.length > 0 ? (
                                            student.payments.map(payment => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{payment.method}</TableCell>
                                                    <TableCell className="text-right">Rs{payment.amount.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right print-hidden">
                                                        <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(payment)}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Receipt
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">No payments recorded yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                </Tabs>
            </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
