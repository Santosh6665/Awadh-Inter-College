
'use client';

import { useEffect, useMemo } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Student, ExamTypes, Marks } from '@/lib/types';
import { updateStudentMarksByTeacher, type MarksFormState } from './actions';
import { SUBJECTS_BY_CLASS } from '@/lib/class-subjects';

interface UpdateMarksFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student?: Student | null;
  examType: ExamTypes;
}

const initialState: MarksFormState = {
  success: false,
  message: '',
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  );
}

export function UpdateMarksForm({ isOpen, setIsOpen, student, examType }: UpdateMarksFormProps) {
  const { toast } = useToast();
  
  const action = student ? updateStudentMarksByTeacher.bind(null, student.id, examType) : async () => initialState;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success',
        description: state.message,
      });
      setIsOpen(false);
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, setIsOpen]);

  const subjectsForClass = useMemo(() => {
    if (!student?.class) return [];
    return SUBJECTS_BY_CLASS[student.class as keyof typeof SUBJECTS_BY_CLASS] || [];
  }, [student?.class]);

  if (!student) return null;
  
  const studentMarks = student.marks?.[examType];
  const examTitle = examType.charAt(0).toUpperCase() + examType.slice(1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update {examTitle} Marks for {student.name}</DialogTitle>
          <DialogDescription>
            Enter the marks obtained out of 100 for each subject in class {student.class}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectsForClass.map(subject => (
                <div key={subject.key} className="space-y-2">
                  <Label htmlFor={subject.key}>{subject.label}</Label>
                  <Input 
                    id={subject.key} 
                    name={subject.key} 
                    type="number" 
                    defaultValue={studentMarks?.[subject.key as keyof Marks]} 
                    min="0"
                    max="100"
                  />
                </div>
            ))}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
