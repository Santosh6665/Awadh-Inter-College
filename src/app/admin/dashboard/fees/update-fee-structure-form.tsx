
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
import type { Student } from '@/lib/types';
import { updateFeeStructure, type FormState } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UpdateFeeStructureFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student?: Student | null;
  feeSettings: any;
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

export function UpdateFeeStructureForm({ isOpen, setIsOpen, student, feeSettings }: UpdateFeeStructureFormProps) {
  const { toast } = useToast();
  
  const action = student ? updateFeeStructure.bind(null, student.id) : async () => initialState;
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

  const classDefaults = feeSettings[student.class] || {};
  const studentFeeStructure = student.feeStructure || {};

  const getFeeValue = (feeHead: string) => {
    // Prioritize student-specific fee, then class default, then empty string
    return studentFeeStructure[feeHead] ?? classDefaults[feeHead] ?? '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Fee Structure for {student.name}</DialogTitle>
          <DialogDescription>
            Enter the fee amounts for each category. Blank fields will use class defaults.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tuition">Tuition Fee</Label>
              <Input id="tuition" name="tuition" type="number" defaultValue={getFeeValue('tuition')} placeholder={classDefaults.tuition || '0'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport">Transport Fee</Label>
              <Input id="transport" name="transport" type="number" defaultValue={getFeeValue('transport')} placeholder={classDefaults.transport || '0'} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam">Exam Fee</Label>
              <Input id="exam" name="exam" type="number" defaultValue={getFeeValue('exam')} placeholder={classDefaults.exam || '0'} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="computer">Computer Fee</Label>
              <Input id="computer" name="computer" type="number" defaultValue={getFeeValue('computer')} placeholder={classDefaults.computer || '0'} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="miscellaneous">Miscellaneous</Label>
              <Input id="miscellaneous" name="miscellaneous" type="number" defaultValue={getFeeValue('miscellaneous')} placeholder={classDefaults.miscellaneous || '0'} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="discount">Discount/Concession</Label>
              <Input id="discount" name="discount" type="number" defaultValue={getFeeValue('discount')} placeholder={classDefaults.discount || '0'} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentPlan">Payment Plan</Label>
            <Select name="paymentPlan" defaultValue={getFeeValue('paymentPlan')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a payment plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
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
