
'use client';

import { useEffect, useState, useActionState, useFormStatus } from 'react';
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
import { setStudentPassword } from './actions';
import Link from 'next/link';

interface SetPasswordDialogProps {
  isOpen: boolean;
  studentId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Set New Password
    </Button>
  );
}

export function SetPasswordDialog({ isOpen, studentId }: SetPasswordDialogProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(isOpen);

  useEffect(() => {
    setIsDialogOpen(isOpen);
  }, [isOpen]);

  // This effect synchronizes server-side state (the 'force_password_reset' cookie)
  // with the client-side dialog visibility. If the component is rendered, `isOpen`
  // is true, and the dialog is shown. We don't need a client-side state for `open`.
  useEffect(() => {
    if (!isOpen) {
        setError('');
        setPassword('');
        setConfirmPassword('');
    }
  }, [isOpen]);

  const handleSubmit = async (formData: FormData) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }
    setError('');

    const result = await setStudentPassword(studentId, formData);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Your password has been updated. You can now use it for future logins.',
      });
      setIsDialogOpen(false);
      // The server action will revalidate and the page will re-render without the dialog
      window.location.reload();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Set Your New Password</DialogTitle>
          <DialogDescription>
            Welcome! For security, please set a new password for your account.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right">
              Confirm
            </Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              className="col-span-3"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          {error && <p className="text-sm text-destructive text-center col-span-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Skip for now
             </Button>
             <Button asChild variant="outline">
                <Link href="/student/logout">Log Out</Link>
             </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
