
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
import { recordSalaryPayment, type FormState } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface RecordSalaryPaymentFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  teacher?: Teacher | null;
  netSalary: number;
  month: Date;
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
      Confirm Payment
    </Button>
  );
}

export function RecordSalaryPaymentForm({ isOpen, setIsOpen, teacher, netSalary, month }: RecordSalaryPaymentFormProps) {
  const { toast } = useToast();
  
  const action = teacher ? recordSalaryPayment.bind(null, teacher.id) : async () => initialState;
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
          <DialogTitle>Record Salary Payment for {teacher.name}</DialogTitle>
          <DialogDescription>
            Confirm the details for the salary payment for {format(month, 'MMMM yyyy')}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="month" value={format(month, 'yyyy-MM')} />
          <div className="space-y-2">
            <Label htmlFor="amount">Net Salary Amount</Label>
            <Input id="amount" name="amount" type="number" defaultValue={netSalary.toFixed(2)} required />
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
          </div>
          <div className="space-y-2">
             <Label htmlFor="method">Payment Method</Label>
             <Select name="method" defaultValue="Bank Transfer" required>
                <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
            </Select>
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

