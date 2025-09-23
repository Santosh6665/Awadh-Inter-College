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
import { SalarySlip } from './salary-slip';
import type { SalaryDetails } from '@/lib/salary-utils';
import { Download } from 'lucide-react';
import { useRef } from 'react';

interface SalarySlipDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  teacher: Teacher | null;
  salaryDetails: SalaryDetails | null;
  month: Date;
}

export function SalarySlipDialog({ isOpen, setIsOpen, teacher, salaryDetails, month }: SalarySlipDialogProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  if (!teacher || !salaryDetails) return null;

  const handlePrint = () => {
    if (!slipRef.current) return;
    const printContent = slipRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Salary Slip</title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Salary Slip for {teacher.name}</DialogTitle>
          <DialogDescription>
            A complete overview of the salary calculation for the selected month.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div ref={slipRef}>
            <SalarySlip teacher={teacher} salaryDetails={salaryDetails} month={month} />
          </div>
        </div>
        <DialogFooter className="print-hidden">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download Slip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
