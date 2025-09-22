
'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Student, ExamTypes } from '@/lib/types';
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
import { Search, Edit, Trash2 } from 'lucide-react';
import { UpdateMarksForm } from './update-marks-form';
import { calculatePercentage, calculateGrade, calculateCumulativePercentage, combineMarks } from '@/lib/result-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { deleteStudentMarks } from './actions';
import { ResultSettings } from './result-settings';


export function ResultsManagement({ students, settings }: { students: Student[], settings: any }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [examType, setExamType] = useState<ExamTypes>('annual');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDeleteResult, setStudentToDeleteResult] = useState<Student | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const confirmDelete = (student: Student) => {
    setStudentToDeleteResult(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!studentToDeleteResult) return;

    startTransition(async () => {
      const result = await deleteStudentMarks(studentToDeleteResult.id, examType);
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
      setStudentToDeleteResult(null);
    });
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class === classFilter : true;
    return nameMatch && classMatch;
  });

  const studentRanks = useMemo(() => {
    const ranks = new Map<string, number>();
    const studentsWithPercentage = students
      .map(student => {
        const { marks: combinedStudentMarks, examCyclesWithMarks } = combineMarks(student.marks, examType);
        return {
          ...student,
          percentage: calculateCumulativePercentage(combinedStudentMarks, examCyclesWithMarks, student.class),
        }
      })
      .filter(s => s.percentage !== null);

    const studentsByClass = studentsWithPercentage.reduce((acc, student) => {
      if (!acc[student.class]) {
        acc[student.class] = [];
      }
      acc[student.class].push(student);
      return acc;
    }, {} as Record<string, typeof studentsWithPercentage>);

    for (const className in studentsByClass) {
      const classStudents = studentsByClass[className];
      classStudents.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
      
      let rank = 1;
      for (let i = 0; i < classStudents.length; i++) {
        if (i > 0 && classStudents[i].percentage! < classStudents[i - 1].percentage!) {
          rank = i + 1;
        }
        ranks.set(classStudents[i].id, rank);
      }
    }
    return ranks;
  }, [students, examType]);


  return (
    <>
      <ResultSettings settings={settings} />
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Manage Student Results</CardTitle>
                <CardDescription>Update marks and view grades for students for the selected exam.</CardDescription>
            </div>
             <Select value={examType} onValueChange={(value) => setExamType(value as ExamTypes)}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="halfYearly">Half-Yearly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
            </div>
             <Input
                placeholder="Filter by class..."
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const { marks: combinedStudentMarks, examCyclesWithMarks } = combineMarks(student.marks, examType);
                    const percentage = calculateCumulativePercentage(combinedStudentMarks, examCyclesWithMarks, student.class);
                    const grade = calculateGrade(percentage);
                    const rank = studentRanks.get(student.id);
                    return (
                        <TableRow key={student.id}>
                            <TableCell className="hidden md:table-cell">{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{`${student.class}-${student.section}`}</TableCell>
                            <TableCell>{percentage !== null ? `${percentage.toFixed(2)}%` : 'N/A'}</TableCell>
                            <TableCell>{grade}</TableCell>
                            <TableCell>{rank ?? 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-1">
                                <Button variant="ghost" size="icon" title="Edit Marks" onClick={() => handleEdit(student)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Delete Marks" onClick={() => confirmDelete(student)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UpdateMarksForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        student={selectedStudent}
        examType={examType}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the 
                    <strong> {examType} exam results</strong> for 
                    <strong> {studentToDeleteResult?.name}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                  {isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
