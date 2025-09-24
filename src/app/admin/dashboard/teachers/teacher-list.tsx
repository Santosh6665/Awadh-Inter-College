'use client';

import { useState, useMemo } from 'react';
import type { Teacher } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Search, Edit, Trash2, MoreVertical } from 'lucide-react';
import { TeacherForm } from './teacher-form';
import { deleteTeacher, toggleAttendancePermission, toggleResultsPermission } from './actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TeacherList({ teachers, settings }: { teachers: Teacher[], settings: any }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sessions = settings?.sessions || [];
  const [selectedSession, setSelectedSession] = useState(settings?.activeSession || '');
  
  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (teacherId: string) => {
    setTeacherToDelete(teacherId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    const result = await deleteTeacher(teacherToDelete);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

  const handlePermissionToggle = async (id: string, canEdit: boolean, type: 'attendance' | 'results') => {
    const action = type === 'attendance' ? toggleAttendancePermission : toggleResultsPermission;
    const result = await action(id, canEdit);
     if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };


  const filteredTeachers = useMemo(() => teachers.filter(teacher => {
    const sessionMatch = teacher.session === selectedSession;
    const nameMatch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return sessionMatch && (nameMatch || subjectMatch);
  }), [teachers, searchQuery, selectedSession]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full">
                <CardTitle>Manage Teachers</CardTitle>
                <CardDescription>Add, edit, or remove teacher records and set permissions.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                      {sessions.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Button onClick={handleAddNew} size="sm" className="flex-shrink-0">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead>Attendance Editing</TableHead>
                  <TableHead>Result Editing</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{teacher.subject}</TableCell>
                      <TableCell>
                        <Switch
                          checked={teacher.canEditAttendance}
                          onCheckedChange={(checked) => handlePermissionToggle(teacher.id, checked, 'attendance')}
                          aria-label="Toggle attendance editing permission"
                        />
                      </TableCell>
                       <TableCell>
                        <Switch
                          checked={teacher.canEditResults}
                          onCheckedChange={(checked) => handlePermissionToggle(teacher.id, checked, 'results')}
                          aria-label="Toggle result editing permission"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => confirmDelete(teacher.id)}>
                               <Trash2 className="mr-2 h-4 w-4" />
                               <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No teachers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TeacherForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        teacher={selectedTeacher}
        activeSession={selectedSession}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the teacher's record from the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
