
'use client';

import { useEffect } from 'react';
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
import type { Teacher } from '@/lib/types';
import { updateTeacherSalary, type FormState } from './actions';

interface SetSalaryFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  teacher?: Teacher | null;
}

const initialState: FormState = {
  success: false,
  message: '',
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

export function SetSalaryForm({ isOpen, setIsOpen, teacher }: SetSalaryFormProps) {
  const { toast } = useToast();
  
  const action = teacher ? updateTeacherSalary.bind(null, teacher.id) : async () => initialState;
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

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Base Salary for {teacher.name}</DialogTitle>
          <DialogDescription>
            Enter the monthly base salary for this teacher.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="baseSalary">Base Salary (Monthly)</Label>
            <Input
              id="baseSalary"
              name="baseSalary"
              type="number"
              defaultValue={teacher.baseSalary || ''}
              placeholder="e.g., 30000"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
