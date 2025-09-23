
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
import { calculateAnnualDue } from '@/lib/fee-utils';


interface CombinedFeeHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  parent: Parent | null;
  feeSettings: any;
}

export function CombinedFeeHistoryDialog({ isOpen, setIsOpen, parent, feeSettings }: CombinedFeeHistoryDialogProps) {

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
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Combined Fee Summary</title>');

        // Link to all stylesheets
        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
            } catch (e) {
              // This can happen with external stylesheets due to CORS
              if (styleSheet.href) {
                return `<link rel="stylesheet" href="${styleSheet.href}">`;
              }
              return '';
            }
          })
          .join('\n');
          
        printWindow.document.write('<style>');
        printWindow.document.write(styles);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Use a small timeout to ensure styles are loaded before printing
        setTimeout(() => {
          printWindow.focus();
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

  const CombinedFeeHistoryContent = () => {
    return (
        <div className="space-y-6">
        <Card className="print-area">
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
                    {parent.children.map((child) => {
                    const { totalAnnualFee, totalPaid, due } = calculateAnnualDue(child, feeSettings);
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
                                <p className="font-bold">Rs{totalAnnualFee.toFixed(2)}</p>
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
                        <TableHead>Period</TableHead>
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
                            <TableCell>{getPaymentPeriod(payment)}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell className="text-right">Rs{payment.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">No payments recorded yet.</TableCell>
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
  }

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
      <div className="hidden print-block">
        <div id="combined-fee-history-print-content">
          <CombinedFeeHistoryContent />
        </div>
      </div>
    </>
  );
}
