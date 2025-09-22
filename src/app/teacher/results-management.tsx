
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
import { Search, Edit, Eye } from 'lucide-react';
import { UpdateMarksForm } from './update-marks-form';
import { calculateGrade, calculateCumulativePercentage, combineMarks } from '@/lib/result-utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResultViewDialog } from '../admin/dashboard/results/result-view-dialog';

export function ResultsManagement({ students, teacher, settings }: { students: Student[], teacher: any, settings: any }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
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

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class === classFilter : true;
    const sectionMatch = sectionFilter ? student.section === sectionFilter : true;
    return nameMatch && classMatch && sectionMatch;
  }).sort((a, b) => a.name.localeCompare(b.name));

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
             <Select value={classFilter} onValueChange={(value) => setClassFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by class..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="Nursery">Nursery</SelectItem>
                    <SelectItem value="LKG">LKG</SelectItem>
                    <SelectItem value="UKG">UKG</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="3">Class 3</SelectItem>
                    <SelectItem value="4">Class 4</SelectItem>
                    <SelectItem value="5">Class 5</SelectItem>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={(value) => setSectionFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by section..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                </SelectContent>
            </Select>
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
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" title="View Result" onClick={() => handleView(student)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} disabled={!canEditResults}>
                                    <Edit className="h-4 w-4" />
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

      <ResultViewDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        student={selectedStudent}
        examType={examType}
        ranks={studentRanks}
        settings={settings}
      />
    </>
  );
}
