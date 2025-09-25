
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, Payment } from '@/lib/types';
import { ExamTypes } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { AttendanceHistory } from './attendance-history';
import { ResultCard } from './result-card';
import { useMemo, useState, useRef } from 'react';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { FeeReceipt } from './fee-receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudentDashboardProps {
  student: Student;
  ranks?: { [key in ExamTypes]?: number | null };
  attendance?: AttendanceRecord[];
  settings: any;
  isParentView?: boolean;
}

export function StudentDashboard({
  student,
  ranks = {},
  attendance = [],
  settings,
  isParentView = false,
}: StudentDashboardProps) {

  const feeDetails = useMemo(() => {
    if (!student) return null;
    return calculateAnnualDue(student, settings);
  }, [student, settings]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const openReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  if (!student) {
    return <p>No student data available.</p>;
  }
  
  if (!feeDetails) {
      return <p>Fee details could not be calculated.</p>;
  }

  const examTypesWithResults = Object.keys(student.marks || {}).filter(examType => 
    (student.marks?.[examType as ExamTypes] || []).length > 0
  ) as ExamTypes[];

  const paymentsInSession = student.payments?.filter(p => {
    try {
      const paymentDate = new Date(p.date);
      const [startYear, endYear] = student.session.split('-').map(Number);
      return paymentDate.getFullYear() >= startYear && paymentDate.getFullYear() <= endYear;
    } catch (e) {
      return false;
    }
  }) || [];
  
  return (
    <div className="min-h-screen bg-gray-100/30 dark:bg-gray-900/50">
      <div className="container mx-auto p-4">
        {!isParentView && (
          <header className="mb-8">
            <Card>
              <CardHeader className="relative flex flex-row items-center space-x-4 p-4 md:p-6">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
                  <AvatarImage src={student.photoUrl} alt={student.name} />
                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl">{student.name}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Class {student.class}-{student.section} | Roll Number: {student.rollNumber} | Session: {student.session}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </header>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 print-hidden">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rank</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 15h16M7 15l1 5M17 15l-1 5M9 9l1 5M15 9l-1 5"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ranks?.['annual'] ? `#${ranks['annual']}` : 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">in final exams</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendance.filter(a => a.status === 'present').length}/{attendance.length} days</div>
                        <p className="text-xs text-muted-foreground">Total present</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fee Due</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", feeDetails.due > 0 ? 'text-destructive' : 'text-green-600')}>
                            Rs{feeDetails.due.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Balance for {student.session}</p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest fee payments for the current session.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Months</TableHead>
                              <TableHead className="text-right">Receipt</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {paymentsInSession.slice(0, 5).map((p, i) => (
                              <TableRow key={i}>
                                  <TableCell>{format(new Date(p.date), 'PPP')}</TableCell>
                                  <TableCell>Rs{p.amount.toFixed(2)}</TableCell>
                                  <TableCell>{p.months?.join(', ') || 'N/A'}</TableCell>
                                  <TableCell className="text-right">
                                      <Button variant="outline" size="sm" onClick={() => openReceipt(p)}>View</Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                          {paymentsInSession.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No payments this session.</TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                  </Table>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle>Fee Structure</CardTitle>
                  <CardDescription>Fee breakdown for {student.class}-{student.section} in {student.session}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Object.entries(student.feeStructure || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <strong>Rs{Number(value).toFixed(2)}</strong>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fees">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Fee Summary</CardTitle>
                <CardDescription>An overview of your fee status for the session {student.session}.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <Card className="p-4">
                    <CardTitle className="text-sm text-muted-foreground">Annual Fee</CardTitle>
                    <p className="text-xl md:text-2xl font-bold">Rs{feeDetails.totalAnnualFee.toFixed(2)}</p>
                  </Card>
                  <Card className="p-4">
                    <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
                    <p className="text-xl md:text-2xl font-bold">Rs{feeDetails.totalPaid.toFixed(2)}</p>
                  </Card>
                  <Card className="p-4">
                    <CardTitle className="text-sm text-muted-foreground">Balance Due</CardTitle>
                    <p className={cn("text-xl md:text-2xl font-bold", feeDetails.due > 0 ? 'text-destructive' : 'text-green-600')}>
                        Rs{feeDetails.due.toFixed(2)}
                    </p>
                  </Card>
                </div>
                
                <h3 className="font-semibold text-lg mt-8 mb-4">Payment History for {student.session}</h3>
                 <ScrollArea className="h-[400px]">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Months</TableHead>
                              <TableHead className="text-right">Receipt</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                           {paymentsInSession.map((p, index) => (
                              <TableRow key={index}>
                                  <TableCell>{format(new Date(p.date), 'PPP')}</TableCell>
                                  <TableCell>Rs{p.amount.toFixed(2)}</TableCell>
                                  <TableCell>{p.method}</TableCell>
                                  <TableCell>{p.months?.join(', ') || 'N/A'}</TableCell>
                                  <TableCell className="text-right">
                                      <Button variant="outline" size="sm" onClick={() => openReceipt(p)}>View</Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                           {paymentsInSession.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No payments found for this session.</TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                    <CardDescription>Your performance in various exams throughout the session.</CardDescription>
                </CardHeader>
                <CardContent>
                    {examTypesWithResults.length > 0 ? (
                        examTypesWithResults.map(examType => (
                            <ResultCard 
                                key={examType} 
                                student={student} 
                                examType={examType} 
                                rank={ranks[examType]} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No exam results available for this session yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceHistory attendanceRecords={attendance} />
          </TabsContent>
        </Tabs>
        
        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          {selectedPayment && (
            <DialogContent className="max-w-3xl">
              <div ref={receiptRef}>
                <FeeReceipt student={student} payment={selectedPayment} settings={settings} />
              </div>
              <DialogFooter className="print-hidden">
                  <Button onClick={handlePrint}>Print Receipt</Button>
                  <Button variant="ghost" onClick={() => setIsReceiptOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

      </div>
    </div>
  );
}
