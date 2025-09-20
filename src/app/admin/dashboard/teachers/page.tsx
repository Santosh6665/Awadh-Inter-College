
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeachers, deleteTeacher } from '@/lib/firebase/firestore';
import type { Teacher } from '@/lib/types';
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


export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const teacherList = await getTeachers();
      setTeachers(teacherList);
    } catch (error) {
      toast({
        title: 'Error fetching teachers',
        description: 'Could not load teacher data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = (id: string) => {
    startTransition(async () => {
        try {
        await deleteTeacher(id);
        toast({
            title: 'Teacher Deleted',
            description: 'The teacher record has been successfully deleted.',
        });
        fetchTeachers(); // Refresh the list
        } catch (error) {
        toast({
            title: 'Error Deleting Teacher',
            description: 'Could not delete the teacher record. Please try again.',
            variant: 'destructive',
        });
        }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Teachers</CardTitle>
          <CardDescription>View, add, edit, and remove teacher records.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/teachers/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
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
                                <Link href={`/admin/dashboard/teachers/edit/${teacher.id}`}>
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
                                This action cannot be undone. This will permanently delete the teacher's
                                record and remove their data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDelete(teacher.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                Continue
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
