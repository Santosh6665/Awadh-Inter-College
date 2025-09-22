
'use client';

import { useMemo, useState } from 'react';
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
import { Search, Edit } from 'lucide-react';
import { UpdateMarksForm } from './update-marks-form';
import { calculatePercentage, calculateGrade } from '@/lib/result-utils';
import { getLoggedInTeacher } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ResultsManagement({ students, teacher }: { students: Student[], teacher: any }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [examType, setExamType] = useState<ExamTypes>('annual');
  const { toast } = useToast();
  
  const canEditResults = teacher?.canEditResults ?? false;

  const handleEdit = (student: Student) => {
     if (!canEditResults) {
      toast({
        title: 'Permission Denied',
        description: "You do not have permission to edit student results.",
        variant: 'destructive',
      });
      return;
    }
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class === classFilter : true;
    return nameMatch && classMatch;
  });

  const studentRanks = useMemo(() => {
    const ranks = new Map<string, number>();
    const studentsWithPercentage = students
      .map(student => ({
        ...student,
        percentage: calculatePercentage(student.marks?.[examType]),
      }))
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
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Manage Student Results</CardTitle>
                <CardDescription>
                  {canEditResults 
                    ? "Update marks and view grades for students."
                    : "View student results. You do not have permission to make changes."
                  }
                </CardDescription>
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
                  <TableHead className="hidden lg:table-cell">Physics</TableHead>
                  <TableHead className="hidden lg:table-cell">Chemistry</TableHead>
                  <TableHead className="hidden lg:table-cell">Maths</TableHead>
                  <TableHead className="hidden lg:table-cell">English</TableHead>
                  <TableHead className="hidden lg:table-cell">Comp. Sci.</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const studentMarks = student.marks?.[examType];
                    const percentage = calculatePercentage(studentMarks);
                    const grade = calculateGrade(percentage);
                    const rank = studentRanks.get(student.id);
                    return (
                        <TableRow key={student.id}>
                            <TableCell className="hidden md:table-cell">{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{`${student.class}-${student.section}`}</TableCell>
                            <TableCell className="hidden lg:table-cell">{studentMarks?.physics ?? 'N/A'}</TableCell>
                            <TableCell className="hidden lg:table-cell">{studentMarks?.chemistry ?? 'N/A'}</TableCell>
                            <TableCell className="hidden lg:table-cell">{studentMarks?.maths ?? 'N/A'}</TableCell>
                            <TableCell className="hidden lg:table-cell">{studentMarks?.english ?? 'N/A'}</TableCell>
                            <TableCell className="hidden lg:table-cell">{studentMarks?.computerScience ?? 'N/A'}</TableCell>
                            <TableCell>{percentage !== null ? `${percentage.toFixed(2)}%` : 'N/A'}</TableCell>
                            <TableCell>{grade}</TableCell>
                            <TableCell>{rank ?? 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} disabled={!canEditResults}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">
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
    </>
  );
}
