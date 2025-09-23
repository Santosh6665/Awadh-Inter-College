
'use client';

import { useMemo } from 'react';
import type { Student, Payment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Download, Mail, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';

const defaultMultipliers = {
    tuition: 12,
    transport: 12,
    computer: 12,
    admission: 1,
    exam: 3,
    miscellaneous: 1,
};

interface FeeHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student: Student | null;
  feeSettings: any;
}

export function FeeHistoryDialog({ isOpen, setIsOpen, student, feeSettings }: FeeHistoryDialogProps) {
  const feeDetails = useMemo(() => {
    if (!student) return null;
    
    const feeMultipliers = { ...defaultMultipliers, ...(feeSettings?.feeMultipliers || {}) };

    const classFeeStructure = feeSettings.feeStructure?.[student.class] || {};
    const studentFeeOverrides = student.feeStructure || {};
    const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

    const feeHeads = [
      { key: 'tuition', label: 'Tuition Fee' },
      { key: 'transport', label: 'Transport Fee' },
      { key: 'computer', label: 'Computer Fee' },
      { key: 'admission', label: 'Admission Fee' },
      { key: 'exam', label: 'Exam Fee' },
      { key: 'miscellaneous', label: 'Miscellaneous/Enrolment' },
    ];
    
    let structuredFees = feeHeads
      .map(head => {
        const amount = finalFeeStructure[head.key] || 0;
        const multiplier = feeMultipliers[head.key as keyof typeof feeMultipliers] || 1;
        return {
            head: head.label,
            calculation: `Rs ${amount} × ${multiplier}`,
            amount: amount * multiplier,
        }
      })
      .filter(fee => fee.amount > 0);
    
    const discount = finalFeeStructure.discount || 0;
    if (discount > 0) {
      structuredFees.push({ head: 'Discount/Concession', calculation: `Rs ${discount} × 1`, amount: -discount });
    }

    const totalFees = structuredFees.reduce((acc, fee) => acc + fee.amount, 0);
    const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const due = totalFees - totalPaid;

    return { structuredFees, totalFees, totalPaid, due };
  }, [student, feeSettings]);

  if (!student || !feeDetails) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('fee-history-print-content');
    if (printContent) {
      const printHtml = printContent.innerHTML;
      
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Fee Receipt</title>');
        // This links to the global CSS file for consistent styling
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => styleSheet.href ? `<link rel="stylesheet" href="${styleSheet.href}">` : '')
            .join('');
        printWindow.document.write(styles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printHtml);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const getPaymentPeriod = (payment: Payment) => {
    if (payment.months?.length === 12) {
      return 'Full Session';
    }
    if (payment.months && payment.months.length > 0) {
      return payment.months.join(', ');
    }
    return payment.month || 'N/A';
  }

  const FeeHistoryContent = () => (
    <div className="space-y-6">
       <Card className="print-area">
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
            </div>
            <div className="text-center mt-2">
              <Badge variant="secondary" className="text-base font-bold tracking-wider">💰 STUDENT FEE RECEIPT</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Student Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><strong>Name:</strong> {student.name}</div>
                    <div><strong>Roll No.:</strong> {student.rollNumber}</div>
                    <div><strong>Class/Section:</strong> {`${student.class}-${student.section}`}</div>
                    <div><strong>Father's Name:</strong> {student.fatherName}</div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">Fee Structure (Annual)</h3>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Fee Head</TableHead>
                    <TableHead className="hidden sm:table-cell">Calculation</TableHead>
                    <TableHead className="text-right">Amount (Rs)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {feeDetails.structuredFees.map((fee, index) => (
                    <TableRow key={index}>
                        <TableCell>{fee.head}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{fee.calculation}</TableCell>
                        <TableCell className={cn("text-right", fee.amount < 0 && 'text-green-600')}>{fee.amount.toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold text-base bg-muted/50">
                    <TableCell colSpan={2}>Total Annual Fees</TableCell>
                    <TableCell className="text-right">Rs{feeDetails.totalFees.toFixed(2)}</TableCell>
                    </TableRow>
                </TableFooter>
                </Table>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount (Rs)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {student.payments && student.payments.length > 0 ? (
                    student.payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</TableCell>
                          <TableCell>{getPaymentPeriod(payment)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell className="text-right">Rs{payment.amount.toFixed(2)}</TableCell>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-t pt-4">
                <div className="p-2 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-xl font-bold">Rs{feeDetails.totalFees.toFixed(2)}</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-green-600">Rs{feeDetails.totalPaid.toFixed(2)}</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className={cn("text-xl font-bold", feeDetails.due > 0 ? 'text-destructive' : 'text-green-600')}>Rs{feeDetails.due.toFixed(2)}</p>
                </div>
            </div>
            <div className="pt-8">
                    <div className="flex justify-end text-center">
                        <div>
                            <p className="border-t-2 border-dashed pt-2">Authorized Signature</p>
                        </div>
                    </div>
                </div>
        </CardContent>
       </Card>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Fee History for {student.name}</DialogTitle>
            <DialogDescription>
              A complete overview of the fee structure and payments.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1">
             <FeeHistoryContent />
          </div>
          <DialogFooter className="print-hidden">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hidden div for printing */}
      <div className="hidden">
        <div id="fee-history-print-content">
          <FeeHistoryContent />
        </div>
      </div>
    </>
  );
}
