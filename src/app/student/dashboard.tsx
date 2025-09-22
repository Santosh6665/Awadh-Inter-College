
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, Payment, ExamTypes, Marks } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { SetPasswordDialog } from './set-password-dialog';
import { calculateCumulativePercentage, calculateGrade, calculateCumulativeTotals, combineMarks } from '@/lib/result-utils';
import { Download, CheckCircle, XCircle, GraduationCap, User, BookOpen, BarChart3, Mail, Phone, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { FeeReceipt } from './fee-receipt';
import { Logo } from '@/components/layout/logo';
import { AttendanceHistory } from './attendance-history';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface StudentDashboardProps {
  student: Student;
  ranks: { [key in ExamTypes]?: number | null };
  attendance: AttendanceRecord[];
  forcePasswordReset: boolean;
  feeSettings: any;
}

export function StudentDashboard({ student, ranks, attendance, forcePasswordReset, feeSettings }: StudentDashboardProps) {
  const [receiptToPrint, setReceiptToPrint] = useState<Payment | null>(null);
  const [examType, setExamType] = useState<ExamTypes>('annual');

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  const handlePrintResult = () => {
    document.body.classList.add('print-result-card');
    window.print();
    document.body.classList.remove('print-result-card');
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

  const ResultCard = ({ student, examType }: { student: Student, examType: ExamTypes }) => {
    const { marks } = combineMarks(student.marks, examType);
    const percentage = calculateCumulativePercentage(marks, examType);
    const grade = calculateGrade(percentage);
    const totals = calculateCumulativeTotals(marks, examType);
    const resultStatus = grade === 'F' ? 'Fail' : 'Pass';
    const hasMarks = Object.values(student.marks || {}).some(examMarks => examMarks && Object.keys(examMarks).length > 0);
    const examTitle = examType.charAt(0).toUpperCase() + examType.slice(1);
    
    const subjectKeys: (keyof Marks)[] = ['physics', 'chemistry', 'maths', 'english', 'computerScience'];

    const examCycles: ExamTypes[] = ['quarterly', 'halfYearly', 'annual'];

    return (
      <div id="result-card-to-print" className="print-block">
        <Card id="result-card" className="border-2 shadow-lg print-area">
          <CardHeader className="p-4 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Logo className="h-16 w-16" />
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
              <Badge variant="secondary" className="text-base font-bold tracking-wider">🎓 {examTitle} Exam Result Card</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasMarks ? (
              <>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Student Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                    <div><strong>Name:</strong> {student.name}</div>
                    <div><strong>Roll No.:</strong> {student.rollNumber}</div>
                    <div><strong>Class/Section:</strong> {`${student.class}-${student.section}`}</div>
                    <div><strong>Date of Birth:</strong> {new Date(student.dob).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</div>
                    <div><strong>Father's Name:</strong> {student.fatherName}</div>
                    <div><strong>Contact No.:</strong> {student.phone}</div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Academic Performance</h3>
                  <Table className="[&_td]:p-2 [&_th]:p-2">
                    <TableHeader>
                        <TableRow>
                            <TableHead rowSpan={2} className="align-bottom text-center">Subject</TableHead>
                            <TableHead colSpan={2} className="text-center border-l">Quarterly</TableHead>
                            <TableHead colSpan={2} className="text-center border-l">Half-Yearly</TableHead>
                            <TableHead colSpan={2} className="text-center border-l">Annual</TableHead>
                            <TableHead colSpan={2} className="text-center border-l bg-muted/50">Total</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead className="text-center border-l">Obtained</TableHead>
                            <TableHead className="text-center">Max</TableHead>
                            <TableHead className="text-center border-l">Obtained</TableHead>
                            <TableHead className="text-center">Max</TableHead>
                            <TableHead className="text-center border-l">Obtained</TableHead>
                            <TableHead className="text-center">Max</TableHead>
                            <TableHead className="text-center border-l bg-muted/50">Obtained</TableHead>
                            <TableHead className="text-center bg-muted/50">Max</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectKeys.map(subject => {
                          const examsToCombine: ExamTypes[] = [];
                            switch (examType) {
                                case 'quarterly': examsToCombine.push('quarterly'); break;
                                case 'halfYearly': examsToCombine.push('quarterly', 'halfYearly'); break;
                                case 'annual': examsToCombine.push('quarterly', 'halfYearly', 'annual'); break;
                            }

                          const totalObtained = examsToCombine.reduce((acc, cycle) => acc + (student.marks?.[cycle]?.[subject] ?? 0), 0);
                          const totalMax = examsToCombine.filter(cycle => student.marks?.[cycle]?.[subject] != null).length * 100;

                          return (
                            <TableRow key={subject}>
                                <TableCell className="capitalize font-medium">{subject.replace(/([A-Z])/g, ' $1')}</TableCell>
                                {examCycles.map(cycle => {
                                    const obtained = student.marks?.[cycle]?.[subject];
                                    const max = obtained != null ? 100 : '-';
                                    return (
                                        <React.Fragment key={cycle}>
                                            <TableCell className="text-center border-l">{obtained ?? '-'}</TableCell>
                                            <TableCell className="text-center">{max}</TableCell>
                                        </React.Fragment>
                                    );
                                })}
                                <TableCell className="text-center border-l bg-muted/50 font-bold">{totalMax > 0 ? totalObtained : '-'}</TableCell>
                                <TableCell className="text-center bg-muted/50 font-semibold">{totalMax > 0 ? totalMax : '-'}</TableCell>
                            </TableRow>
                          )
                      })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold bg-muted/50 text-base">
                            <TableCell>Grand Total</TableCell>
                            {examCycles.map(cycle => {
                                const cycleObtained = subjectKeys.reduce((acc, sub) => acc + (student.marks?.[cycle]?.[sub] ?? 0), 0);
                                const cycleMax = subjectKeys.filter(sub => student.marks?.[cycle]?.[sub] != null).length * 100;
                                return (
                                    <React.Fragment key={cycle}>
                                        <TableCell className="text-center border-l">{cycleMax > 0 ? cycleObtained : '-'}</TableCell>
                                        <TableCell className="text-center">{cycleMax > 0 ? cycleMax : '-'}</TableCell>
                                    </React.Fragment>
                                );
                            })}
                             <TableCell className="text-center border-l">{totals.totalObtainedMarks}</TableCell>
                             <TableCell className="text-center">{totals.totalMaxMarks}</TableCell>
                        </TableRow>
                    </TableFooter>
                  </Table>
                </div>
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><strong>Percentage:</strong> <span className="font-mono">{percentage?.toFixed(2)}%</span></div>
                        <div className="flex justify-between"><strong>Overall Grade:</strong> <span className="font-mono">{grade}</span></div>
                        <div className="flex justify-between"><strong>Class Rank:</strong> <span className="font-mono">{ranks[examType] ?? 'N/A'}</span></div>
                        <div className="flex justify-between"><strong>Result Status:</strong> <Badge className={cn(resultStatus === 'Pass' ? 'bg-green-600' : 'bg-red-600', 'text-white')}>{resultStatus === 'Pass' ? '✅ Pass' : '❌ Fail'}</Badge></div>
                        </div>
                    </div>
                </div>
                <div className="pt-8">
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
              <p className="text-muted-foreground text-center py-8">No results are available for the {examTitle} exam.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };


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
                    <div className="flex justify-end mb-4 print-hidden">
                        <Select value={examType} onValueChange={(value) => setExamType(value as ExamTypes)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Select Exam" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="halfYearly">Half-Yearly</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ResultCard student={student} examType={examType} />
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
