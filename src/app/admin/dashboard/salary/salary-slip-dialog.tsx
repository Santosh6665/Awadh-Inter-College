
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
  teacher: (Teacher & { status?: 'paid' | 'pending' }) | null;
  salaryDetails: SalaryDetails | null;
  month: Date;
}

export function SalarySlipDialog({ isOpen, setIsOpen, teacher, salaryDetails, month }: SalarySlipDialogProps) {
  if (!teacher || !salaryDetails) return null;
  
  const handlePrint = () => {
    const printContent = document.getElementById('salary-slip-print-content');
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Salary Slip</title>');

        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
            } catch (e) {
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

        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 250);
      }
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
            <SalarySlip teacher={teacher} salaryDetails={salaryDetails} month={month} status={teacher.status || 'pending'} />
        </div>
        <DialogFooter className="print-hidden">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download Slip
          </Button>
        </DialogFooter>
        <div className="hidden print-block">
          <div id="salary-slip-print-content">
             <SalarySlip teacher={teacher} salaryDetails={salaryDetails} month={month} status={teacher.status || 'pending'} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
