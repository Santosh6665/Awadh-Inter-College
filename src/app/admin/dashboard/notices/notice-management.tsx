
'use client';

import { useState } from 'react';
import type { Notice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { PlusCircle, Edit, Trash2, MoreVertical } from 'lucide-react';
import { NoticeForm } from './notice-form';
import { deleteNotice } from './actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function NoticeManagement({ notices }: { notices: Notice[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedNotice(null);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (noticeId: string) => {
    setNoticeToDelete(noticeId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;
    const result = await deleteNotice(noticeToDelete);
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
    setNoticeToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full">
                <CardTitle>Manage Events & Notices</CardTitle>
                <CardDescription>Publish, edit, or remove announcements and events.</CardDescription>
            </div>
            <Button onClick={handleAddNew} size="sm" className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Notice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.length > 0 ? (
                  notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{notice.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(notice.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
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
                            <DropdownMenuItem onClick={() => handleEdit(notice)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => confirmDelete(notice.id)}>
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
                    <TableCell colSpan={4} className="text-center">
                      No notices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <NoticeForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        notice={selectedNotice}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this notice.
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
