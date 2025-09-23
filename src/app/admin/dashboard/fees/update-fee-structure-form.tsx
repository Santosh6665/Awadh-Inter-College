
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

const feeHeads = [
    { key: 'tuition', label: 'Tuition Fee' },
    { key: 'transport', label: 'Transport Fee' },
    { key: 'computer', label: 'Computer Fee' },
    { key: 'admission', label: 'Admission Fee' },
    { key: 'exam', label: 'Exam Fee' },
    { key: 'miscellaneous', label: 'Miscellaneous' },
    { key: 'discount', label: 'Discount/Concession' },
];

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

  const classDefaults = feeSettings?.feeStructure?.[student.class] || {};
  const studentFeeStructure = student.feeStructure || {};
  const feeMultipliers = feeSettings?.feeMultipliers || {};


  const getFeeValue = (feeHead: string) => {
    return studentFeeStructure[feeHead] ?? '';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Fee Structure for {student.name}</DialogTitle>
          <DialogDescription>
            Enter specific fees for this student to override class defaults. Blank fields will use the defaults set for Class {student.class}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {feeHeads.map(head => (
                 <div key={head.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={head.key}>{head.label}</Label>
                        {head.key !== 'discount' && (
                             <span className="text-xs text-muted-foreground">
                                Annual: (x{feeMultipliers[head.key as keyof typeof feeMultipliers] || 1})
                            </span>
                        )}
                    </div>
                    <Input 
                        id={head.key} 
                        name={head.key} 
                        type="number" 
                        defaultValue={getFeeValue(head.key)} 
                        placeholder={`Default: ${classDefaults[head.key] || '0'}`}
                    />
                </div>
            ))}
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
