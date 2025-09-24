
'use client';

import { useEffect, useMemo } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
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
import type { Parent } from '@/lib/types';
import { recordCombinedPayment, type FormState } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface RecordCombinedPaymentFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  parent?: Parent | null;
}

const initialState: FormState = {
  success: false,
  message: '',
};

const months = [
  'April', 'May', 'June', 'July', 'August', 'September', 
  'October', 'November', 'December', 'January', 'February', 'March'
];

const quarters = [
    { label: 'Quarter 1 (Apr-Jun)', months: ['April', 'May', 'June'] },
    { label: 'Quarter 2 (Jul-Sep)', months: ['July', 'August', 'September'] },
    { label: 'Quarter 3 (Oct-Dec)', months: ['October', 'November', 'December'] },
    { label: 'Quarter 4 (Jan-Mar)', months: ['January', 'February', 'March'] },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Record Payment
    </Button>
  );
}

export function RecordCombinedPaymentForm({ isOpen, setIsOpen, parent }: RecordCombinedPaymentFormProps) {
  const { toast } = useToast();
  
  const studentIds = parent?.children.map(c => c.id) || [];
  const action = parent ? recordCombinedPayment.bind(null, parent.id, studentIds) : async () => initialState;
  const [state, formAction] = useFormState(action, initialState);

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

  if (!parent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Combined Payment for {parent.parentName}</DialogTitle>
          <DialogDescription>
            Enter the total amount paid. It will be auto-distributed among the children with outstanding balances.
            <br />
            <strong>Total Due: Rs{parent.totalDue.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" placeholder="Enter total amount paid" required />
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
          </div>
          <div className="space-y-2">
             <Label htmlFor="method">Payment Method</Label>
             <Select name="method" defaultValue="Cash" required>
                <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label>Payment for Months</Label>
            <p className="text-xs text-muted-foreground">Note: Month selection is for all children and record-keeping purposes.</p>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-2">
                {months.map(month => (
                    <div key={month} className="flex items-center space-x-2">
                        <Checkbox id={`month-${month}`} name="months" value={month} />
                        <Label htmlFor={`month-${month}`} className="text-sm font-normal">
                            {month}
                        </Label>
                    </div>
                ))}
            </div>
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
