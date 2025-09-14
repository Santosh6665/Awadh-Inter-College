
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Assignment = {
  id: string;
  title: string;
  subject: string;
  class: string;
  dueDate: string;
};

const initialAssignments: Assignment[] = [
    { id: 'ASG001', title: 'Chapter 3: Laws of Motion Problems', subject: 'Physics', class: 'XII-A', dueDate: '2024-09-15' },
    { id: 'ASG002', title: 'Calculus Worksheet', subject: 'Mathematics', class: 'XII-A', dueDate: '2024-09-12' },
];


export default function ManageAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
    const { toast } = useToast();

    const handleCreateAssignment = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newAssignment = {
            id: `ASG${String(assignments.length + 1).padStart(3, '0')}`,
            title: formData.get('title') as string,
            subject: formData.get('subject') as string,
            class: formData.get('class') as string,
            dueDate: formData.get('dueDate') as string,
        };
        
        setAssignments(prev => [...prev, newAssignment]);
        toast({
            title: 'Assignment Created',
            description: 'The new assignment has been successfully created and assigned.',
        });
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Manage Assignments</CardTitle>
            <CardDescription>Create, distribute, and grade assignments.</CardDescription>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Assignment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to create a new assignment.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAssignment}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" name="title" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">Subject</Label>
                            <Input id="subject" name="subject" className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="class" className="text-right">Class</Label>
                            <Input id="class" name="class" placeholder="e.g., XII-A" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                            <Input id="dueDate" name="dueDate" type="date" className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" name="description" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">File</Label>
                            <Input id="file" type="file" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">Create</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {assignments.map(assignment => (
                    <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{assignment.subject}</TableCell>
                        <TableCell>{assignment.class}</TableCell>
                        <TableCell>{assignment.dueDate}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
