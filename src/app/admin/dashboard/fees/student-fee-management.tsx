
'use client';

import { useState, useMemo } from 'react';
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
import { Search, Edit, PlusCircle, Eye } from 'lucide-react';
import { UpdateFeeStructureForm } from './update-fee-structure-form';
import { RecordPaymentForm } from './record-payment-form';
import { FeeHistoryDialog } from './fee-history-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentFeeManagementProps {
  students: Student[];
  feeSettings: any;
}

export function StudentFeeManagement({ students, feeSettings }: StudentFeeManagementProps) {
  const [isFeeStructureFormOpen, setIsFeeStructureFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const studentsByParentPhone = useMemo(() => {
    return students.reduce((acc, student) => {
      if (student.parentPhone) {
        if (!acc[student.parentPhone]) {
          acc[student.parentPhone] = [];
        }
        acc[student.parentPhone].push(student.id);
      }
      return acc;
    }, {} as Record<string, string[]>);
  }, [students]);
  
  const handleEditFeeStructure = (student: Student) => {
    setSelectedStudent(student);
    setIsFeeStructureFormOpen(true);
  };

  const handleRecordPayment = (student: Student) => {
    setSelectedStudent(student);
    setIsPaymentFormOpen(true);
  };
  
  const handleViewHistory = (student: Student) => {
    setSelectedStudent(student);
    setIsHistoryDialogOpen(true);
  };

  const filteredStudents = students
    .filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const classMatch = classFilter ? student.class === classFilter : true;
      const sectionMatch = sectionFilter ? student.section === sectionFilter : true;
      return nameMatch && classMatch && sectionMatch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const calculateFeeStatus = (student: Student) => {
    const classFeeStructure = feeSettings[student.class] || {};
    const studentFeeOverrides = student.feeStructure || {};

    const finalFeeStructure = {
      ...classFeeStructure,
      ...studentFeeOverrides,
    };
    
    const { 
      tuition = 0,
      admission = 0,
      transport = 0, 
      exam = 0, 
      computer = 0, 
      miscellaneous = 0,
      discount = 0 
    } = finalFeeStructure;

    let totalFees = (tuition + admission + transport + exam + computer + miscellaneous) - discount;
    
    // Apply sibling discount if applicable
    const siblings = student.parentPhone ? studentsByParentPhone[student.parentPhone] : [];
    if (siblings && siblings.length > 1 && feeSettings.siblingDiscount > 0) {
      // Simple logic: apply discount if not the first child in the list
      if (siblings[0] !== student.id) {
          totalFees -= feeSettings.siblingDiscount;
      }
    }

    const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const due = totalFees - totalPaid;

    return { totalFees, totalPaid, due };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Manage Student Fees</CardTitle>
                <CardDescription>Update fee structures and record payments for individual students.</CardDescription>
            </div>
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
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Fees Paid</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const { totalFees, totalPaid, due } = calculateFeeStatus(student);
                    return (
                        <TableRow key={student.id}>
                            <TableCell className="hidden md:table-cell">{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{`${student.class}-${student.section}`}</TableCell>
                            <TableCell>Rs{totalFees.toFixed(2)}</TableCell>
                            <TableCell>Rs{totalPaid.toFixed(2)}</TableCell>
                            <TableCell className={due > 0 ? 'text-destructive font-semibold' : ''}>Rs{due.toFixed(2)}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon" title="View Details" onClick={() => handleViewHistory(student)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Edit Fee Structure" onClick={() => handleEditFeeStructure(student)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Record Payment" onClick={() => handleRecordPayment(student)}>
                                    <PlusCircle className="h-4 w-4" />
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

      <UpdateFeeStructureForm
        isOpen={isFeeStructureFormOpen}
        setIsOpen={setIsFeeStructureFormOpen}
        student={selectedStudent}
        feeSettings={feeSettings}
      />
      
      <RecordPaymentForm
        isOpen={isPaymentFormOpen}
        setIsOpen={setIsPaymentFormOpen}
        student={selectedStudent}
      />
      
      <FeeHistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        student={selectedStudent}
        feeSettings={feeSettings}
      />
    </>
  );
}
