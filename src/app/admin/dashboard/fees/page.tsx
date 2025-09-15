
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudents, updateStudent } from '@/lib/firebase/realtimedb';
import type { Student } from '@/lib/types';
import { Loader2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ManageFeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentList = await getStudents();
      setStudents(studentList);
    } catch (error) {
      toast({
        title: 'Error fetching students',
        description: 'Could not load student data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenDialog = (student: Student) => {
    setSelectedStudent(student);
    setPaymentAmount(student.amountDue || 0);
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent || paymentAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newAmountDue = (selectedStudent.amountDue || 0) - paymentAmount;
      const updatedData: Partial<Student> = {
        amountDue: newAmountDue,
        feeStatus: newAmountDue <= 0 ? 'Paid' : 'Due',
      };

      await updateStudent(selectedStudent.id, updatedData);
      toast({
        title: 'Payment Recorded',
        description: `Successfully recorded payment for ${selectedStudent.name}.`,
      });
      fetchStudents(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error Recording Payment',
        description: 'Could not save the payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
    const getBadgeVariant = (status?: string) => {
        switch (status) {
        case 'Paid':
            return 'default';
        case 'Overdue':
            return 'destructive';
        case 'Due':
            return 'secondary';
        default:
            return 'outline';
        }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Fees</CardTitle>
        <CardDescription>Oversee fee structures, collections, and outstanding payments.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Dialog>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>₹{student.amountDue || 0}</TableCell>
                    <TableCell>
                        <Badge variant={getBadgeVariant(student.feeStatus)}>
                            {student.feeStatus || 'N/A'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DialogTrigger asChild>
                         <Button variant="outline" onClick={() => handleOpenDialog(student)} disabled={student.feeStatus === 'Paid'}>
                           Record Payment
                         </Button>
                       </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment for {selectedStudent?.name}</DialogTitle>
                 <DialogDescription>
                    Current amount due: ₹{selectedStudent?.amountDue || 0}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                 </DialogClose>
                 <DialogClose asChild>
                    <Button onClick={handleRecordPayment} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Payment
                    </Button>
                 </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
