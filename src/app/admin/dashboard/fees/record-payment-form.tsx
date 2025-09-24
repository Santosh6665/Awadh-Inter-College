
'use client';

import { useEffect, useMemo } from 'react';
import { useFormStatus, useActionState } from 'react-dom';
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
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { Student } from '@/lib/types';
import { recordPayment, type FormState } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface RecordPaymentFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student?: Student | null;
  feeSettings: any;
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

export function RecordPaymentForm({ isOpen, setIsOpen, student, feeSettings }: RecordPaymentFormProps) {
  const { toast } = useToast();
  
  const action = student ? recordPayment.bind(null, student.id) : async () => initialState;
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

  const paymentPlan = useMemo(() => {
    if (!student) return 'monthly';
    const classDefaults = feeSettings[student.class] || {};
    return student.feeStructure?.paymentPlan || classDefaults.paymentPlan || 'monthly';
  }, [student, feeSettings]);

  const paidMonths = useMemo(() => {
    if (!student?.payments) return new Set();
    const allPaidMonths = student.payments.flatMap(p => p.months || []);
    return new Set(allPaidMonths);
  }, [student]);


  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment for {student.name}</DialogTitle>
          <DialogDescription>
            Enter the details of the payment received.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" placeholder="Enter amount" required/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required/>
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
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment for Period (Plan: <span className="capitalize font-semibold">{paymentPlan}</span>)</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-2">
                {paymentPlan === 'monthly' && months.map(month => {
                    const isPaid = paidMonths.has(month);
                    return (
                        <div key={month} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`month-${month}-${student.id}`} 
                                name="months" 
                                value={month} 
                                disabled={isPaid}
                            />
                            <Label 
                                htmlFor={`month-${month}-${student.id}`} 
                                className="text-sm font-normal flex items-center gap-1.5"
                            >
                                {month}
                                {isPaid && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                            </Label>
                        </div>
                    )
                })}
                {paymentPlan === 'quarterly' && quarters.map(q => {
                    const areAllMonthsPaid = q.months.every(m => paidMonths.has(m));
                    return (
                        <div key={q.label} className="flex items-center space-x-2 col-span-2">
                            <Checkbox 
                                id={`q-${q.label}-${student.id}`} 
                                name="months" 
                                value={q.months.join(',')} 
                                disabled={areAllMonthsPaid}
                            />
                            <Label htmlFor={`q-${q.label}-${student.id}`} className="text-sm font-normal flex items-center gap-1.5">
                                {q.label}
                                {areAllMonthsPaid && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                            </Label>
                        </div>
                    )
                })}
                {paymentPlan === 'yearly' && (
                    <div className="flex items-center space-x-2 col-span-2">
                        <Checkbox 
                            id={`yearly-${student.id}`} 
                            name="months" 
                            value={months.join(',')}
                            disabled={paidMonths.size >= 12}
                        />
                        <Label htmlFor={`yearly-${student.id}`} className="text-sm font-normal flex items-center gap-1.5">
                            Full Session (April - March)
                            {paidMonths.size >= 12 && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                        </Label>
                    </div>
                )}
            </div>
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
