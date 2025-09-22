
'use client';

import { useEffect } from 'react';
import { useActionState, useFormStatus } from 'react';
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
import type { Student } from '@/lib/types';
import { updateStudentMarksByTeacher, type MarksFormState } from './actions';
import { Textarea } from '@/components/ui/textarea';

interface UpdateMarksFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student?: Student | null;
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

export function UpdateMarksForm({ isOpen, setIsOpen, student }: UpdateMarksFormProps) {
  const { toast } = useToast();
  
  const action = student ? updateStudentMarksByTeacher.bind(null, student.id) : async () => initialState;
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

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Marks for {student.name}</DialogTitle>
          <DialogDescription>
            Enter the marks obtained out of 100 for each subject.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="physics">Physics</Label>
              <Input id="physics" name="physics" type="number" defaultValue={student.marks?.physics} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chemistry">Chemistry</Label>
              <Input id="chemistry" name="chemistry" type="number" defaultValue={student.marks?.chemistry} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maths">Maths</Label>
              <Input id="maths" name="maths" type="number" defaultValue={student.marks?.maths} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="english">English</Label>
              <Input id="english" name="english" type="number" defaultValue={student.marks?.english} />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="computerScience">Computer Science</Label>
              <Input id="computerScience" name="computerScience" type="number" defaultValue={student.marks?.computerScience} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" name="remarks" defaultValue={student.marks?.remarks} placeholder="Enter remarks..."/>
            </div>
          <DialogFooter>
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
