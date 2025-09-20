
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudents, updateStudent } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import type { Marks } from '@/lib/types';


export default function ManageResultsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Marks>({});
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
    setMarks(student.marks || {});
  };
  
  const handleMarkChange = (subject: keyof Marks, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setMarks(prev => ({ ...prev, [subject]: numValue }));
  };

  const handleSaveChanges = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
        const updatedStudentData: Partial<Student> = { marks };
        await updateStudent(selectedStudent.id, updatedStudentData);
        toast({
            title: 'Marks Saved',
            description: `Successfully saved marks for ${selectedStudent.name}.`,
        });
        fetchStudents(); // Refresh data
    } catch (error) {
        toast({
            title: 'Error Saving Marks',
            description: 'Could not save the marks. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const subjects: {key: keyof Marks; label: string}[] = [
    { key: 'physics', label: 'Physics' },
    { key: 'chemistry', label: 'Chemistry' },
    { key: 'maths', label: 'Mathematics' },
    { key: 'english', label: 'English' },
    { key: 'computerScience', label: 'Computer Science' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Exam Results</CardTitle>
        <CardDescription>Enter, view, and update student marks for examinations.</CardDescription>
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
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class} - {student.section}</TableCell>
                    <TableCell className="text-right">
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => handleOpenDialog(student)}>
                          <Edit className="mr-2 h-4 w-4" /> Manage Marks
                        </Button>
                      </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Marks for {selectedStudent?.name}</DialogTitle>
                <DialogDescription>
                    Update the scores for each subject below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {subjects.map(subject => (
                   <div key={subject.key} className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={subject.key} className="text-right">{subject.label}</Label>
                        <Input 
                            id={subject.key}
                            type="number"
                            value={marks[subject.key] || ''}
                            onChange={(e) => handleMarkChange(subject.key, e.target.value)}
                            className="col-span-3"
                         />
                   </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                 <DialogClose asChild>
                    <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
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
