
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
import type { Teacher } from '@/lib/types';
import { addTeacher, updateTeacher, type TeacherFormState } from './actions';

interface TeacherFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  teacher?: Teacher | null;
}

const initialState: TeacherFormState = {
  success: false,
  message: '',
  errors: null,
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Add Teacher'}
    </Button>
  );
}

export function TeacherForm({ isOpen, setIsOpen, teacher }: TeacherFormProps) {
  const { toast } = useToast();
  const isEditing = !!teacher;

  const action = isEditing ? updateTeacher.bind(null, teacher.id) : addTeacher;
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

  const formattedDob = teacher?.dob ? new Date(teacher.dob).toISOString().split('T')[0] : '';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the teacher's details below."
              : 'Fill in the details for the new teacher.'}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={teacher?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={teacher?.email} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" defaultValue={teacher?.subject} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={teacher?.phone} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" defaultValue={formattedDob} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" name="qualification" defaultValue={teacher?.qualification} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <SubmitButton isEditing={isEditing} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
