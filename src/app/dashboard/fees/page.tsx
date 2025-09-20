
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { getStudentByEmail } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function FeesPage() {
    const [user, setUser] = useState<User | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser?.email) {
            setUser(currentUser);
            try {
                const studentData = await getStudentByEmail(currentUser.email);
                setStudent(studentData);
            } catch (error) {
                toast({
                    title: 'Error fetching fee data',
                    description: 'Could not load your fee information.',
                    variant: 'destructive'
                });
            }
        }
        setLoading(false);
        });
        return () => unsubscribe();
    }, [toast]);

    const handlePayNow = () => {
        toast({
            title: 'Redirecting to Payment',
            description: 'You are being redirected to our payment partner.',
        });
        // In a real app, you would redirect to a payment gateway.
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
        <CardTitle>Fee Receipts</CardTitle>
        <CardDescription>View and download your fee payment history.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
             <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : student ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">Current Tuition Fees</TableCell>
                    <TableCell>₹{student.amountDue || 0}</TableCell>
                    <TableCell>
                    <Badge variant={getBadgeVariant(student.feeStatus)}>
                        {student.feeStatus || 'N/A'}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    {student.feeStatus === 'Paid' ? (
                        <Button variant="outline" size="icon" disabled>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download Receipt</span>
                        </Button>
                    ) : (
                        <Button onClick={handlePayNow}>Pay Now</Button>
                    )}
                    </TableCell>
                </TableRow>
            </TableBody>
            </Table>
        ) : (
            <p>No fee information found for your account.</p>
        )}
      </CardContent>
    </Card>
  );
}
