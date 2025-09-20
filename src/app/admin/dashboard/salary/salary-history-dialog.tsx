
'use client';

import type { Teacher } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { CollegeLogo } from '@/components/icons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useMemo } from 'react';

interface SalaryHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  teacher: Teacher | null;
}

export function SalaryHistoryDialog({ isOpen, setIsOpen, teacher }: SalaryHistoryDialogProps) {

  const salaryDetails = useMemo(() => {
    if (!teacher) return null;

    const baseSalary = teacher.baseSalary || 0;
    const totalPaid = (teacher.salaryPayments || []).reduce((acc, p) => acc + p.amount, 0);
    // Note: A simple "due" calculation might not be accurate for salaries without more complex logic (e.g., monthly tracking).
    // This dialog primarily serves as a history log.
    return { baseSalary, totalPaid };
  }, [teacher]);

  if (!teacher || !salaryDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Salary History for {teacher.name}</DialogTitle>
          <DialogDescription>
            A complete overview of the salary and payment history.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
           <Card>
              <CardHeader className="p-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <CollegeLogo className="h-16 w-16 text-primary" />
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-primary">Awadh Inter College</h2>
                            <p className="text-xs text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                        </div>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <Badge variant="secondary" className="text-base font-bold tracking-wider">💰 SALARY SUMMARY</Badge>
                  </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                  <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Teacher Details</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div><strong>Name:</strong> {teacher.name}</div>
                          <div><strong>Subject:</strong> {teacher.subject}</div>
                          <div><strong>Email:</strong> {teacher.email}</div>
                          <div><strong>Phone:</strong> {teacher.phone}</div>
                      </div>
                  </div>
                  
                  <div>
                      <h3 className="text-lg font-semibold mb-2">Salary Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 rounded-md bg-muted">
                              <p className="text-sm text-muted-foreground">Base Salary (Monthly)</p>
                              <p className="text-xl font-bold">₹{salaryDetails.baseSalary.toFixed(2)}</p>
                          </div>
                          <div className="p-2 rounded-md bg-muted">
                              <p className="text-sm text-muted-foreground">Total Paid (All Time)</p>
                              <p className="text-xl font-bold text-green-600">₹{salaryDetails.totalPaid.toFixed(2)}</p>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                      <Table>
                      <TableHeader>
                          <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                           <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Amount (₹)</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {teacher.salaryPayments && teacher.salaryPayments.length > 0 ? (
                          teacher.salaryPayments.map(payment => (
                              <TableRow key={payment.id}>
                              <TableCell>{new Date(payment.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</TableCell>
                              <TableCell>{payment.method}</TableCell>
                              <TableCell>{payment.remarks || 'N/A'}</TableCell>
                              <TableCell className="text-right">₹{payment.amount.toFixed(2)}</TableCell>
                              </TableRow>
                          ))
                          ) : (
                          <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">No payments recorded yet.</TableCell>
                          </TableRow>
                          )}
                      </TableBody>
                       <TableFooter>
                          <TableRow className="font-bold text-base bg-muted/50">
                          <TableCell colSpan={3}>Total Paid</TableCell>
                          <TableCell className="text-right">₹{salaryDetails.totalPaid.toFixed(2)}</TableCell>
                          </TableRow>
                      </TableFooter>
                      </Table>
                  </div>
              </CardContent>
           </Card>
        </div>
        <DialogFooter className="print-hidden">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
