
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudents, deleteStudent } from '@/lib/firebase/realtimedb';
import type { Student } from '@/lib/types';
import { Loader2, PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = (id: string) => {
    startTransition(async () => {
        try {
        await deleteStudent(id);
        toast({
            title: 'Student Deleted',
            description: 'The student record has been successfully deleted.',
        });
        fetchStudents(); // Refresh the list
        } catch (error) {
        toast({
            title: 'Error Deleting Student',
            description: 'Could not delete the student record. Please try again.',
            variant: 'destructive',
        });
        }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Students</CardTitle>
          <CardDescription>View, add, edit, and remove student records.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/students/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Student
          </Link>
        </Button>
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
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class} - {student.section}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                              <Link href={`/admin/dashboard/students/edit/${student.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the student's
                            account and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(student.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
