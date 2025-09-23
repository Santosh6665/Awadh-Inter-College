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
  const slipRef = useRef<HTMLDivElement>(null);

  if (!teacher || !salaryDetails) return null;
  

  const handlePrint = () => {
    if (!slipRef.current) return;

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    const cardNode = slipRef.current.cloneNode(true) as HTMLElement;
    printContainer.appendChild(cardNode);
    document.body.appendChild(printContainer);

    document.body.classList.add('printing');
    window.print();
    document.body.classList.remove('printing');
    
    document.body.removeChild(printContainer);
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
            <SalarySlip teacher={teacher} salaryDetails={salaryDetails} month={month} status={teacher.status || 'pending'} />
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
