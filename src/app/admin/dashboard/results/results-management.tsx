
'use client';

import { useState } from 'react';
import type { Student } from '@/lib/types';
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

export function ResultsManagement({ students }: { students: Student[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class === classFilter : true;
    return nameMatch && classMatch;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Manage Student Results</CardTitle>
                <CardDescription>Update marks and view grades for students.</CardDescription>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative w-full max-w-sm">
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
                className="w-full max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Physics</TableHead>
                  <TableHead>Chemistry</TableHead>
                  <TableHead>Maths</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>Comp. Sci.</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const percentage = calculatePercentage(student.marks);
                    const grade = calculateGrade(percentage);
                    return (
                        <TableRow key={student.id}>
                            <TableCell>{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{`${student.class}-${student.section}`}</TableCell>
                            <TableCell>{student.marks?.physics ?? 'N/A'}</TableCell>
                            <TableCell>{student.marks?.chemistry ?? 'N/A'}</TableCell>
                            <TableCell>{student.marks?.maths ?? 'N/A'}</TableCell>
                            <TableCell>{student.marks?.english ?? 'N/A'}</TableCell>
                            <TableCell>{student.marks?.computerScience ?? 'N/A'}</TableCell>
                            <TableCell>{percentage !== null ? `${percentage.toFixed(2)}%` : 'N/A'}</TableCell>
                            <TableCell>{grade}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
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
      />
    </>
  );
}
