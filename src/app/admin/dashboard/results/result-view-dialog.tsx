
'use client';

import type { Student, ExamTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResultCard } from '@/app/student/result-card';

interface ResultViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student: Student | null;
  examType: ExamTypes;
  ranks: Map<string, number>;
  settings: any;
}

export function ResultViewDialog({ isOpen, setIsOpen, student, examType, ranks, settings }: ResultViewDialogProps) {
  if (!student) return null;

  const studentRank = {
    [examType]: ranks.get(student.id)
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Viewing Result for {student.name}</DialogTitle>
          <DialogDescription>
            This is a preview of the result card as seen by the student.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <ResultCard 
            student={student} 
            ranks={studentRank} 
            settings={settings} 
          />
        </div>
        <DialogFooter className="print-hidden">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
