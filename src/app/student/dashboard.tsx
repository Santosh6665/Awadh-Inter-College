
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, Payment, ExamTypes, Marks } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { Download, CheckCircle, XCircle, GraduationCap, User, BookOpen, BarChart3, Mail, Phone, Edit, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { FeeReceipt } from './fee-receipt';
import { AttendanceHistory } from './attendance-history';
import { ResultCard } from './result-card';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { FeeHistoryDialog } from '../admin/dashboard/fees/fee-history-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStudentById } from './actions';


interface StudentDashboardProps {
  student: Student;
  ranks: { [key in ExamTypes]?: number | null };
  attendance: AttendanceRecord[];
  settings: any;
  allSessions: string[];
  isParentView?: boolean;
}

export function StudentDashboard({ student: initialStudent, ranks: initialRanks, attendance: initialAttendance, settings, allSessions, isParentView = false }: StudentDashboardProps) {
  const [receiptToPrint, setReceiptToPrint] = useState<Payment | null>(null);
  const [isFeeHistoryOpen, setIsFeeHistoryOpen] = useState(false);

  const [student, setStudent] = useState(initialStudent);
  const [ranks, setRanks] = useState(initialRanks);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(initialStudent.session);


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
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        const receiptNode = document.getElementById('fee-receipt-to-print-content')?.cloneNode(true);
        if (receiptNode) {
          printContainer.appendChild(receiptNode);
          document.body.appendChild(printContainer);
        }

        document.body.classList.add('printing');
        window.print();
        document.body.classList.remove('printing');

        if (receiptNode) {
          document.body.removeChild(printContainer);
        }
        setReceiptToPrint(null);
    }, 100);
  };
  
  const feeDetails = useMemo(() => {
    // Pass the selectedSession to ensure calculations are scoped correctly for historical views.
    const { due, totalAnnualFee, totalPaid } = calculateAnnualDue(student, settings, selectedSession);
    const classFeeStructure = settings.feeStructure?.[student.class] || {};
    const studentFeeOverrides = student.feeStructure || {};
    const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };
    const paymentPlan = finalFeeStructure.paymentPlan || 'Not set';

    return { totalFees: totalAnnualFee, totalPaid, due, paymentPlan };
  }, [student, settings, selectedSession]);


  const getPaymentPeriod = (payment: Payment) => {
    if (payment.months?.length === 12) {
      return 'Full Session';
    }
    if (payment.months && payment.months.length > 0) {
      return payment.months.join(', ');
    }
    return payment.month || 'N/A';
  }
  
  const handleSessionChange = async (session: string) => {
    if (isParentView) return; // Parent dashboard handles this separately
    setIsLoading(true);
    setSelectedSession(session);
    const newStudentData = await getStudentById(`${student.rollNumber}-${session}`);
    if (newStudentData) {
        // Ranks and attendance would need to be re-fetched for the selected session.
        // For simplicity, we'll clear them for historical views.
        setStudent(newStudentData);
        setRanks({});
        setAttendance([]);
    }
    setIsLoading(false);
  };


  return (
    <>
       <div className="hidden">
          {receiptToPrint && (
            <div id="fee-receipt-to-print-content">
                <FeeReceipt student={student} payment={receiptToPrint} settings={settings} />
            </div>
          )}
       </div>
        <FeeHistoryDialog
            isOpen={isFeeHistoryOpen}
            setIsOpen={setIsFeeHistoryOpen}
            student={student}
            feeSettings={settings}
        />
      <div id="student-dashboard" className="bg-muted/50">
        <div className={cn(!isParentView && "container mx-auto py-8")}>
            <Card className={cn(!isParentView && "min-h-screen")}>
            <CardHeader className="relative flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 print-hidden gap-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
                    <AvatarImage src={student.photoUrl} alt={student.name} />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl">{student.name}</CardTitle>
                <CardDescription className="text-base">Welcome to your student portal.</CardDescription>
                </div>
                 {!isParentView && allSessions.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Viewing Session:</span>
                        <Select
                        defaultValue={student.session}
                        onValueChange={handleSessionChange}
                        >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Session" />
                        </SelectTrigger>
                        <SelectContent>
                            {allSessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-0 p-4 md:p-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <Tabs defaultValue="profile" className="w-full">
                <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-rap">
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
                                            <TableCell className="font-medium">Session</TableCell>
                                            <TableCell>{student.session}</TableCell>
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
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                <div>
                                    <CardTitle>Fee Payment Details</CardTitle>
                                    <CardDescription>A summary of your fee structure and payment history for session {student.session}.</CardDescription>
                                </div>
                                <Button onClick={() => setIsFeeHistoryOpen(true)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    View & Download Full Receipt
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                <h3 className="text-lg font-semibold mb-2">Recent Payments</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="hidden sm:table-cell">Period</TableHead>
                                            <TableHead className="text-right">Amount (Rs)</TableHead>
                                            <TableHead className="text-right print-hidden">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {student.payments && student.payments.length > 0 ? (
                                            student.payments.filter(p => p.amount > 0).slice(0, 5).map(payment => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{getPaymentPeriod(payment)}</TableCell>
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
                )}
            </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
