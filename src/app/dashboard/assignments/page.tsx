
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const assignments = [
  {
    id: 'AS001',
    subject: 'Physics',
    title: 'Chapter 3: Laws of Motion',
    dueDate: '2024-09-10',
    status: 'Pending',
  },
  {
    id: 'AS002',
    subject: 'Mathematics',
    title: 'Calculus Worksheet',
    dueDate: '2024-09-08',
    status: 'Submitted',
  },
  {
    id: 'AS003',
    subject: 'English',
    title: 'Essay on Shakespeare',
    dueDate: '2024-09-05',
    status: 'Graded',
  },
];

export default function AssignmentsPage() {
    const { toast } = useToast();

    const handleAction = (title: string) => {
        toast({
            title: 'Feature Not Available',
            description: `${title} functionality is not yet implemented.`,
        });
    };

    const getBadgeVariant = (status: string) => {
        switch (status) {
        case 'Pending':
            return 'destructive';
        case 'Submitted':
            return 'secondary';
        case 'Graded':
            return 'default';
        default:
            return 'outline';
        }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments</CardTitle>
        <CardDescription>Download your assignments and upload your submissions here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.subject}</TableCell>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(assignment.status)}>
                    {assignment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleAction('Download')}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download Assignment</span>
                    </Button>
                    {assignment.status === 'Pending' && (
                        <Button variant="outline" size="icon" onClick={() => handleAction('Upload')}>
                            <Upload className="h-4 w-4" />
                            <span className="sr-only">Upload Submission</span>
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
