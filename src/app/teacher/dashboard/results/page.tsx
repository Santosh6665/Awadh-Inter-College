
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudents } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Marks = {
  physics?: number;
  chemistry?: number;
  maths?: number;
  english?: number;
};

export default function ManageResultsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
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
    fetchStudents();
  }, [toast]);

  const handleOpenDialog = (student: Student) => {
    setSelectedStudent(student);
    // In a real app, you would fetch existing marks for the student
    setMarks({ physics: 88, chemistry: 92, maths: 76, english: 85 });
  };

  const handleSaveChanges = () => {
     toast({
        title: 'Marks Saved',
        description: `Successfully saved marks for ${selectedStudent?.name}.`
    });
    // Here you would save the marks to your database
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Results</CardTitle>
        <CardDescription>Enter and publish student examination results for the mid-term exams.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => handleOpenDialog(student)}>
                          <Edit className="mr-2 h-4 w-4" /> Enter Marks
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enter Marks for {selectedStudent?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor="physics">Physics</Label>
                                <Input id="physics" type="number" value={marks.physics || ''} onChange={(e) => setMarks(prev => ({ ...prev, physics: +e.target.value }))} />
                           </div>
                           <div className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor="chemistry">Chemistry</Label>
                                <Input id="chemistry" type="number" value={marks.chemistry || ''} onChange={(e) => setMarks(prev => ({ ...prev, chemistry: +e.target.value }))} />
                           </div>
                           <div className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor="maths">Mathematics</Label>
                                <Input id="maths" type="number" value={marks.maths || ''} onChange={(e) => setMarks(prev => ({ ...prev, maths: +e.target.value }))} />
                           </div>
                           <div className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor="english">English</Label>
                                <Input id="english" type="number" value={marks.english || ''} onChange={(e) => setMarks(prev => ({ ...prev, english: +e.target.value }))} />
                           </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
