
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBooks, addBook, updateBook, getStudents } from '@/lib/firebase/firestore';
import type { Book, Student } from '@/lib/types';
import { Loader2, PlusCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function ManageLibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookList, studentList] = await Promise.all([getBooks(), getStudents()]);
      setBooks(bookList);
      setStudents(studentList);
    } catch (error) {
      toast({
        title: 'Error fetching data',
        description: 'Could not load library data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBook = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const newBookData = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      status: 'Available' as 'Available',
    };

    try {
      await addBook(newBookData);
      toast({ title: 'Book Added', description: 'The new book has been added to the library.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not add the book.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleIssueBook = async () => {
    if (!selectedBook || !selectedStudentId) {
        toast({ title: 'Selection Missing', description: 'Please select a book and a student.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
        const student = students.find(s => s.id === selectedStudentId);
        await updateBook(selectedBook.id, { 
            status: 'Issued',
            issuedTo: selectedStudentId,
            issuedToName: student?.name,
        });
        toast({ title: 'Book Issued', description: `${selectedBook.title} has been issued.` });
        fetchData();
    } catch (error) {
        toast({ title: 'Error', description: 'Could not issue the book.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
        setSelectedStudentId('');
    }
  };
  
  const handleReturnBook = async (book: Book) => {
    setIsSubmitting(true);
    try {
        await updateBook(book.id, { 
            status: 'Available',
            issuedTo: '', // Using empty string to clear the field
            issuedToName: '',
        });
        toast({ title: 'Book Returned', description: `${book.title} has been returned.` });
        fetchData();
    } catch (error) {
        toast({ title: 'Error', description: 'Could not process the return.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Library</CardTitle>
          <CardDescription>Oversee book inventory, borrowing records, and library members.</CardDescription>
        </div>
         <Dialog>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Book</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                 <form onSubmit={handleAddBook}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" name="title" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="author" className="text-right">Author</Label>
                        <Input id="author" name="author" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Book
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {books.map((book) => (
                    <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                        <Badge variant={book.status === 'Available' ? 'default' : 'secondary'}>
                            {book.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{book.issuedToName || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {book.status === 'Available' ? (
                            <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setSelectedBook(book)}>Issue</Button>
                            </DialogTrigger>
                        ) : (
                            <Button variant="outline" onClick={() => handleReturnBook(book)}>Return</Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue Book: {selectedBook?.title}</DialogTitle>
                    <DialogDescription>Select a student to issue this book to.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="student-select">Student</Label>
                    <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
                        <SelectTrigger id="student-select">
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map(student => (
                                <SelectItem key={student.id} value={student.id}>{student.name} ({student.rollNumber})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                     <DialogClose asChild>
                        <Button onClick={handleIssueBook} disabled={isSubmitting || !selectedStudentId}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Issue Book
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
