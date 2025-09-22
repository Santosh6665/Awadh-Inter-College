
'use client';

import { useMemo } from 'react';
import type { Student, Parent, Payment } from '@/lib/types';
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
import { Download, Mail, Phone, User, Users, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';
import { Separator } from '@/components/ui/separator';

interface CombinedFeeHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  parent: Parent | null;
  feeSettings: any;
}

export function CombinedFeeHistoryDialog({ isOpen, setIsOpen, parent, feeSettings }: CombinedFeeHistoryDialogProps) {

  const calculateFeeStatus = (student: Student) => {
    const classFeeStructure = feeSettings[student.class] || {};
    const studentFeeOverrides = student.feeStructure || {};
    const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };
    
    const { tuition = 0, admission = 0, transport = 0, exam = 0, computer = 0, miscellaneous = 0, discount = 0 } = finalFeeStructure;
    const totalFees = (tuition + admission + transport + exam + computer + miscellaneous) - discount;
    const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const due = totalFees - totalPaid;
    return { totalFees, totalPaid, due, feeStructure: finalFeeStructure };
  };

  const allPayments = useMemo(() => {
    if (!parent) return [];
    return parent.children
        .flatMap(child => (child.payments || []).map(p => ({ ...p, childName: child.name })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [parent]);


  if (!parent) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('combined-fee-history-print-content');
    if (printContent) {
      const printHtml = printContent.innerHTML;
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Combined Fee Summary</title>');
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

  const CombinedFeeHistoryContent = () => (
    <div className="space-y-6">
       <Card>
        <CardHeader className="p-4 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <Logo className="h-16 w-16" />
                  <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-primary">Awadh Inter College</h2>
                      <p className="text-xs text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                  </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <Badge variant="secondary" className="text-base font-bold tracking-wider">💰 COMBINED FEE SUMMARY</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Parent Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><strong>Name:</strong> {parent.parentName}</div>
                    <div><strong>Phone:</strong> {parent.id}</div>
                </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Children Summary</h3>
              <div className="space-y-4">
                {parent.children.map(child => {
                   const { totalFees, totalPaid, due } = calculateFeeStatus(child);
                   return (
                    <Card key={child.id} className="bg-muted/30">
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">{child.name}</CardTitle>
                        <CardDescription>{`Class ${child.class}-${child.section}`}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                         <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="p-1 rounded bg-background">
                              <p className="text-xs text-muted-foreground">Total Fees</p>
                              <p className="font-bold">Rs{totalFees.toFixed(2)}</p>
                            </div>
                            <div className="p-1 rounded bg-background">
                              <p className="text-xs text-muted-foreground">Total Paid</p>
                              <p className="font-bold text-green-600">Rs{totalPaid.toFixed(2)}</p>
                            </div>
                            <div className="p-1 rounded bg-background">
                              <p className="text-xs text-muted-foreground">Balance Due</p>
                              <p className={cn("font-bold", due > 0 ? 'text-destructive' : 'text-green-600')}>Rs{due.toFixed(2)}</p>
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                   )
                })}
              </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Combined Payment History</h3>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount (Rs)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allPayments.length > 0 ? (
                    allPayments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</TableCell>
                          <TableCell>{payment.childName}</TableCell>
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
                <p className="text-sm text-muted-foreground">Family Total Fees</p>
                <p className="text-xl font-bold">Rs{parent.totalFees.toFixed(2)}</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Family Total Paid</p>
                <p className="text-xl font-bold text-green-600">Rs{parent.totalPaid.toFixed(2)}</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Family Balance Due</p>
                <p className={cn("text-xl font-bold", parent.totalDue > 0 ? 'text-destructive' : 'text-green-600')}>Rs{parent.totalDue.toFixed(2)}</p>
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
            <DialogTitle>Combined Fee Summary for {parent.parentName}</DialogTitle>
            <DialogDescription>
              A complete overview of the fee structure and payments for all children.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-4">
             <CombinedFeeHistoryContent />
          </div>
          <DialogFooter className="print-hidden">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Download Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hidden div for printing */}
      <div className="hidden">
        <div id="combined-fee-history-print-content">
          <style>
            {`
              @media print {
                body {
                  background: white !important;
                  color: black !important;
                }
                .print-area {
                  box-shadow: none !important;
                  border: none !important;
                }
              }
            `}
          </style>
          <CombinedFeeHistoryContent />
        </div>
      </div>
    </>
  );
}
