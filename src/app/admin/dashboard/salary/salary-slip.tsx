
'use client';

import type { Teacher, SalaryPayment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { Logo } from '@/components/layout/logo';
import { Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SalarySlipProps {
  teacher: Teacher;
  payment: SalaryPayment;
}

export function SalarySlip({ teacher, payment }: SalarySlipProps) {
    const amountInWords = (amount: number): string => {
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const numToWords = (num: number): string => {
            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + numToWords(num % 100) : '');
            if (num < 100000) return numToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
            return num.toString();
        };
        
        const words = numToWords(amount);
        return words.charAt(0).toUpperCase() + words.slice(1) + ' only';
    };
    
  return (
    <Card className="w-full max-w-2xl mx-auto border-2 shadow-none rounded-none print-area">
       <CardHeader className="p-4 bg-muted/30">
            <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Logo className="h-16 w-16" />
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-primary">Awadh Inter College</h2>
                    <p className="text-xs text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" /> <span>+91 6393071946</span>
                        <Mail className="h-3 w-3" /> <span>info@awadhcollege.edu</span>
                    </div>
                </div>
            </div>
            </div>
            <div className="text-center mt-2">
                <Badge variant="secondary" className="text-base font-bold tracking-wider">💰 SALARY SLIP</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-6">
            <div className="flex justify-between text-sm mb-6">
                <div>
                    <span className="font-semibold">Slip No:</span> {payment.id}
                </div>
                <div>
                    <span className="font-semibold">Date:</span> {new Date(payment.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                </div>
            </div>

            <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2">Teacher Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><strong>Name:</strong> {teacher.name}</div>
                    <div><strong>Subject:</strong> {teacher.subject}</div>
                    <div><strong>Email:</strong> {teacher.email}</div>
                    <div><strong>Phone:</strong> {teacher.phone}</div>
                </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <p className="font-medium">Salary Payment</p>
                            <p className="text-xs text-muted-foreground">Method: {payment.method}</p>
                             {payment.month && <p className="text-xs text-muted-foreground">Month: {payment.month}</p>}
                        </TableCell>
                        <TableCell className="text-right font-mono">{payment.amount.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold text-base">
                        <TableCell>Total Amount Paid</TableCell>
                        <TableCell className="text-right font-mono">₹{payment.amount.toFixed(2)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>

            <p className="text-sm mt-4">
                <strong>Amount in Words:</strong> {amountInWords(payment.amount)}
            </p>
            
             <div className="pt-8 mt-8">
                <div className="flex justify-between text-center">
                    <div>
                        <p className="border-t-2 border-dashed pt-2">Receiver's Signature</p>
                    </div>
                    <div>
                        <p className="border-t-2 border-dashed pt-2">Authorized Signature</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
                This is a computer-generated slip.
            </p>
        </CardContent>
    </Card>
  );
}
