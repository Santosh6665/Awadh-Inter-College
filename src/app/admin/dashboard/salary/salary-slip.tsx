'use client';

import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { Logo } from '@/components/layout/logo';
import { Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SalaryDetails } from '@/lib/salary-utils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SalarySlipProps {
  teacher: Teacher;
  salaryDetails: SalaryDetails;
  month: Date;
  status: 'paid' | 'pending';
}

export function SalarySlip({ teacher, salaryDetails, month, status }: SalarySlipProps) {
    const amountInWords = (amount: number): string => {
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const numToWords = (num: number): string => {
            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + numToWords(num % 100) : '');
            if (num < 100000) return numToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
            return num.toString();
        };
        
        const words = numToWords(Math.floor(amount));
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
             <Badge className={cn("text-sm", status === 'paid' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white')}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            </div>
            <div className="text-center mt-2">
                <Badge variant="secondary" className="text-base font-bold tracking-wider">💰 SALARY SLIP - {format(month, 'MMMM yyyy')}</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-6">
            <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2">Teacher Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><strong>Name:</strong> {teacher.name}</div>
                    <div><strong>Employee ID:</strong> {teacher.employeeId}</div>
                    <div><strong>Designation:</strong> {teacher.designation}</div>
                    <div><strong>Department:</strong> {teacher.subject}</div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Earnings</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount (Rs)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Base Salary</TableCell>
                                <TableCell className="text-right font-mono">{(teacher.baseSalary || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold">
                                <TableCell>Total Earnings</TableCell>
                                <TableCell className="text-right font-mono">{(teacher.baseSalary || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        </TableFooter>
                     </Table>
                </div>
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Deductions</h3>
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount (Rs)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Absence ({salaryDetails.deductionDays} days)</TableCell>
                                <TableCell className="text-right font-mono">{salaryDetails.deductionAmount.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                             <TableRow className="font-bold">
                                <TableCell>Total Deductions</TableCell>
                                <TableCell className="text-right font-mono">{salaryDetails.deductionAmount.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableFooter>
                     </Table>
                </div>
            </div>
             <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2">Attendance Summary</h3>
                <div className="flex justify-around text-center text-sm">
                    <div><p className="font-bold text-lg">{salaryDetails.totalDaysInMonth}</p><p className="text-muted-foreground">Total Days</p></div>
                    <div><p className="font-bold text-lg">{salaryDetails.presentDays}</p><p className="text-muted-foreground">Present</p></div>
                    <div><p className="font-bold text-lg text-destructive">{salaryDetails.absentDays}</p><p className="text-muted-foreground">Absent</p></div>
                    <div><p className="font-bold text-lg">{salaryDetails.holidayDays}</p><p className="text-muted-foreground">Holidays</p></div>
                    <div><p className="font-bold text-lg text-primary">{salaryDetails.totalPresentDays}</p><p className="text-muted-foreground">Payable Days</p></div>
                </div>
            </div>
            
            <Card className="bg-primary text-primary-foreground p-4 text-center">
                <p className="text-lg">Net Salary</p>
                <p className="text-3xl font-bold font-mono">Rs {salaryDetails.netSalary.toFixed(2)}</p>
                <p className="text-sm mt-1">({amountInWords(salaryDetails.netSalary)})</p>
            </Card>
            
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
