
'use client';

import type { Student, Payment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { useRef, useMemo } from 'react';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { format } from 'date-fns';
import { Logo } from '@/components/layout/logo';
import { School, Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FeeHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  student: Student | null;
  feeSettings: any;
  selectedSession: string;
}

export function FeeHistoryDialog({ isOpen, setIsOpen, student, feeSettings, selectedSession }: FeeHistoryDialogProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${student?.name}-Fee-Slip-${selectedSession}`,
  });

  const feeDetails = useMemo(() => {
    if (!student || student.session !== selectedSession) return null;
    return calculateAnnualDue(student, feeSettings);
  }, [student, feeSettings, selectedSession]);

  if (!student || !feeDetails) {
    return null; 
  }

  const paymentsInSession = student.payments?.filter(p => {
      try {
        const paymentDate = new Date(p.date);
        const [startYear, endYear] = selectedSession.split('-').map(Number);
        return paymentDate.getFullYear() >= startYear && paymentDate.getFullYear() <= endYear;
      } catch (e) {
        return false;
      }
    }) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Fee History & Slip</DialogTitle>
          <DialogDescription>
            Review the fee history and print the slip for {student.name} for the session {selectedSession}.
          </DialogDescription>
        </DialogHeader>

        <div ref={componentRef} className="p-6 bg-white text-black">
            {/* Printable Slip Component */}
            <div className="printable-slip">
                <header className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{feeSettings.schoolName || 'Springdale Public School'}</h1>
                            <p className="text-sm text-gray-500">{feeSettings.schoolAddress || '123 Education Lane, Cityville'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-700">Fee Receipt</h2>
                        <p className="text-sm text-gray-500">Session: {selectedSession}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 mt-6">
                    <div>
                        <h3 className="font-semibold text-gray-600 mb-2">Student Details</h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Name:</strong> {student.name}</p>
                            <p><strong>Class:</strong> {student.class}-{student.section}</p>
                            <p><strong>Roll No:</strong> {student.rollNumber}</p>
                            <p><strong>Father&apos;s Name:</strong> {student.fatherName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="font-semibold text-gray-600 mb-2">Receipt Details</h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Receipt Date:</strong> {format(new Date(), 'PPP')}</p>
                            <p><strong>Student ID:</strong> {student.id}</p>
                        </div>
                    </div>
                </section>
                
                <section className="mt-8">
                    <h3 className="font-semibold text-gray-600 mb-2">Payment History for {selectedSession}</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-gray-500">Date</th>
                                    <th className="p-3 text-left font-medium text-gray-500">Amount</th>
                                    <th className="p-3 text-left font-medium text-gray-500">Method</th>
                                    <th className="p-3 text-left font-medium text-gray-500">Months Paid</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paymentsInSession.length > 0 ? (
                                    paymentsInSession.map((p, index) => (
                                        <tr key={index}>
                                            <td className="p-3">{format(new Date(p.date), 'PPP')}</td>
                                            <td className="p-3">Rs{p.amount.toFixed(2)}</td>
                                            <td className="p-3">{p.method}</td>
                                            <td className="p-3">{p.months?.join(', ') || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-3 text-center text-gray-500">No payments recorded for this session.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <section className="mt-8 grid grid-cols-5 gap-4">
                    <div className="col-span-3 space-y-4">
                        <h3 className="font-semibold text-gray-600 mb-2">Fee Structure Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm border p-4 rounded-lg">
                            {Object.entries(student.feeStructure || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{key}:</span>
                                    <span className="font-medium">Rs{Number(value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2 space-y-4 text-right">
                        <h3 className="font-semibold text-gray-600 mb-2">Summary</h3>
                        <div className="space-y-2 border p-4 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">Annual Fee:</p>
                                <p className="text-lg font-semibold">Rs{feeDetails.totalAnnualFee.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">Total Paid:</p>
                                <p className="text-lg font-semibold">Rs{feeDetails.totalPaid.toFixed(2)}</p>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold text-gray-700">Balance Due:</p>
                                <p className="text-2xl font-bold text-red-600">Rs{feeDetails.due.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 pt-4 border-t-2 border-dashed">
                    <p className="text-xs text-center text-gray-500">
                        This is a computer-generated receipt and does not require a signature. 
                        If you have any questions, please contact the school office.
                    </p>
                    <div className="flex justify-center items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><Mail size={12} /> {feeSettings.schoolEmail || 'info@springdale.edu'}</span>
                        <span className="flex items-center gap-1"><Phone size={12} /> {feeSettings.schoolPhone || '+1 (123) 456-7890'}</span>
                    </div>
                </footer>
            </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handlePrint}>Print Slip</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
