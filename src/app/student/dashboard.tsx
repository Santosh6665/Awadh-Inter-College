
'use client';

import type { Student, AttendanceRecord, Payment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import Link from 'next/link';
import { SetPasswordDialog } from './set-password-dialog';
import { calculatePercentage, calculateGrade, calculateTotals } from '@/lib/result-utils';
import { Download, CheckCircle, XCircle, Clock, GraduationCap, User, BookOpen, BarChart3, Mail, Phone, CalendarDays, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { CollegeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { FeeReceipt } from './fee-receipt';


interface StudentDashboardProps {
  student: Student;
  rank: number | null;
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
  feeSettings: any;
}

export function StudentDashboard({ student, rank, attendance, forcePasswordReset, feeSettings }: StudentDashboardProps) {
  const [receiptToPrint, setReceiptToPrint] = useState<Payment | null>(null);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const percentage = calculatePercentage(student.marks);
  const grade = calculateGrade(percentage);
  const totals = calculateTotals(student.marks);
  const resultStatus = grade === 'F' ? 'Fail' : 'Pass';

  const hasMarks = student.marks && Object.values(student.marks).some(mark => typeof mark === 'number');

  const handlePrintResult = () => {
    document.body.classList.add('print-result');
    window.print();
    document.body.classList.remove('print-result');
  };
  
  const handlePrintReceipt = (payment: Payment) => {
    setReceiptToPrint(payment);
    // Timeout to allow state to update before printing
    setTimeout(() => {
        document.body.classList.add('print-receipt');
        window.print();
        document.body.classList.remove('print-receipt');
        setReceiptToPrint(null);
    }, 100);
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
       {receiptToPrint && (
        <div id="receipt-to-print" className="hidden print-block">
          <FeeReceipt student={student} payment={receiptToPrint} feeDetails={feeDetails} />
        </div>
      )}
      <div id="student-dashboard" className="bg-[rgb(231,249,254)] p-4 md:p-6">
        <Card className="min-h-screen">
          <CardHeader className="relative flex items-center justify-between p-4 md:p-6 print-hidden">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border">
                <AvatarImage src={student.photoUrl} alt={student.name} />
                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-xl md:text-2xl">{student.name}</CardTitle>
                    <CardDescription>Welcome to your student portal.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <Tabs defaultValue="profile" className="w-full">
               <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-nowrap">
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
                          <div className="overflow-x-auto">
                            <Table className="table-fixed w-full">
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium w-1/3 md:w-1/4">Name</TableCell>
                                        <TableCell className="break-words">{student.name}</TableCell>
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
                                        <TableCell className="break-words">{student.fatherName}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Address</TableCell>
                                        <TableCell className="whitespace-normal break-words">{student.address}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Phone</TableCell>
                                        <TableCell className="whitespace-normal break-words">{student.phone}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Email</TableCell>
                                        <TableCell className="whitespace-normal break-words">{student.email}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                          </div>
                      </CardContent>
                  </Card>
              </TabsContent>
               <TabsContent value="results" className="mt-4">
                  <Card id="result-card" className="border-2 shadow-lg">
                      <CardHeader className="p-4 bg-muted/30">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <CollegeLogo className="h-16 w-16 text-primary" />
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-bold text-primary">Awadh Inter College</h2>
                                    <p className="text-xs text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground mt-1">
                                       <Phone className="h-3 w-3" /> <span>+91 6393071946</span>
                                       <Mail className="h-3 w-3" /> <span>info@awadhcollege.edu</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handlePrintResult} variant="outline" size="sm" className="print-hidden self-start sm:self-center">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                           </Button>
                          </div>
                          <div className="text-center mt-2">
                            <Badge variant="secondary" className="text-base font-bold tracking-wider">🎓 STUDENT RESULT CARD</Badge>
                          </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6 space-y-6">
                          {hasMarks ? (
                              <>
                                  <div className="border rounded-lg p-4">
                                     <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/> 🧑‍🎓 Student Details</h3>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                                        <div><strong>Name:</strong> {student.name}</div>
                                        <div><strong>Roll No.:</strong> {student.rollNumber}</div>
                                        <div><strong>Class/Section:</strong> {`${student.class}-${student.section}`}</div>
                                        <div><strong>Date of Birth:</strong> {new Date(student.dob).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</div>
                                      </div>
                                  </div>

                                  <div className="border rounded-lg p-4">
                                     <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> 📘 Academic Performance</h3>
                                      <Table>
                                          <TableHeader>
                                              <TableRow>
                                                  <TableHead>Subject</TableHead>
                                                  <TableHead className="text-center">Maximum Marks</TableHead>
                                                  <TableHead className="text-center">Marks Obtained</TableHead>
                                                  <TableHead className="text-right">Grade</TableHead>
                                              </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {Object.entries(student.marks || {}).filter(([key]) => key !== 'remarks' && typeof student.marks?.[key as keyof typeof student.marks] === 'number').map(([subject, marks]) => (
                                              <TableRow key={subject}>
                                                <TableCell className="capitalize">{subject.replace(/([A-Z])/g, ' $1')}</TableCell>
                                                <TableCell className="text-center">100</TableCell>
                                                <TableCell className="text-center">{marks ?? 'N/A'}</TableCell>
                                                <TableCell className="text-right">{calculateGrade(marks as number)}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                           <TableFooter>
                                            <TableRow className="font-bold bg-muted/50">
                                                <TableCell>Total</TableCell>
                                                <TableCell className="text-center">{totals.totalMaxMarks}</TableCell>
                                                <TableCell className="text-center">{totals.totalObtainedMarks}</TableCell>
                                                <TableCell className="text-right">—</TableCell>
                                            </TableRow>
                                          </TableFooter>
                                      </Table>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border rounded-lg p-4 print-p-4">
                                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> 📊 Summary</h3>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><strong>Percentage:</strong> <span className="font-mono">{percentage?.toFixed(2)}%</span></div>
                                        <div className="flex justify-between"><strong>Overall Grade:</strong> <span className="font-mono">{grade}</span></div>
                                        <div className="flex justify-between"><strong>Result Status:</strong> <Badge className={cn(resultStatus === 'Pass' ? 'bg-green-600' : 'bg-red-600', 'text-white')}>{resultStatus === 'Pass' ? '✅ Pass' : '❌ Fail'}</Badge></div>
                                      </div>
                                    </div>
                                    <div className="border rounded-lg p-4 print-p-4">
                                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> 🏅 Remarks</h3>
                                      <p className="text-sm text-muted-foreground italic">
                                        “{student.marks?.remarks || 'Good effort. Keep improving.'}”
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-8 print-signatures">
                                    <h3 className="font-semibold text-lg mb-8 text-center flex items-center justify-center gap-2">🔖 Signatures</h3>
                                    <div className="flex justify-between text-center">
                                      <div>
                                        <p className="border-t-2 border-dashed pt-2">Class Teacher</p>
                                      </div>
                                      <div>
                                        <p className="border-t-2 border-dashed pt-2">Principal</p>
                                      </div>
                                    </div>
                                  </div>
                              </>
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
                        <CardDescription>A summary of your fee structure and payment history.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Fee Structure</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fee Head</TableHead>
                                        <TableHead className="text-right">Amount (₹)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeDetails.structuredFees.map((fee, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{fee.head}</TableCell>
                                            <TableCell className={cn("text-right", fee.amount < 0 && 'text-green-600')}>{fee.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold text-base">
                                        <TableCell>Total Fees</TableCell>
                                        <TableCell className="text-right">₹{feeDetails.totalFees.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                            <Card className="p-4">
                                <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
                                <p className="text-xl md:text-2xl font-bold">₹{feeDetails.totalFees.toFixed(2)}</p>
                            </Card>
                             <Card className="p-4">
                                <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
                                <p className="text-xl md:text-2xl font-bold text-green-600">₹{feeDetails.totalPaid.toFixed(2)}</p>
                            </Card>
                             <Card className="p-4">
                                <CardTitle className="text-sm text-muted-foreground">Balance Due</CardTitle>
                                <p className={cn("text-xl md:text-2xl font-bold", feeDetails.due > 0 ? 'text-destructive' : 'text-green-600')}>₹{feeDetails.due.toFixed(2)}</p>
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
                                        <TableHead className="text-right">Amount (₹)</TableHead>
                                        <TableHead className="text-right print-hidden">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.payments && student.payments.length > 0 ? (
                                        student.payments.map(payment => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{payment.method}</TableCell>
                                                <TableCell className="text-right">₹{payment.amount.toFixed(2)}</TableCell>
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
    </>
  );
}

    

    

