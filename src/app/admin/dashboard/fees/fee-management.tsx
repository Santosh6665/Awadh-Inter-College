
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
import { Search, Edit, PlusCircle } from 'lucide-react';
import { UpdateFeeStructureForm } from './update-fee-structure-form';
import { RecordPaymentForm } from './record-payment-form';

export function FeeManagement({ students, feeSettings }: { students: Student[], feeSettings: any }) {
  const [isFeeStructureFormOpen, setIsFeeStructureFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  const handleEditFeeStructure = (student: Student) => {
    setSelectedStudent(student);
    setIsFeeStructureFormOpen(true);
  };

  const handleRecordPayment = (student: Student) => {
    setSelectedStudent(student);
    setIsPaymentFormOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const classMatch = classFilter ? student.class === classFilter : true;
    return nameMatch && classMatch;
  });

  const calculateFeeStatus = (student: Student) => {
    const studentFeeStructure = student.feeStructure;
    const classFeeStructure = feeSettings[student.class] || {};

    const structure = {
      ...classFeeStructure,
      ...studentFeeStructure,
    };
    
    const positiveFees = (structure.tuition || 0) + 
                         (structure.transport || 0) +
                         (structure.exam || 0) +
                         (structure.library || 0) +
                         (structure.miscellaneous || 0);
    const discount = structure.discount || 0;
    const totalFees = positiveFees - discount;

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
                <CardDescription>Update fee structures and record payments for students.</CardDescription>
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
                            <TableCell>₹{totalFees.toFixed(2)}</TableCell>
                            <TableCell>₹{totalPaid.toFixed(2)}</TableCell>
                            <TableCell className={due > 0 ? 'text-destructive font-semibold' : ''}>₹{due.toFixed(2)}</TableCell>
                            <TableCell className="text-right space-x-2">
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
    </>
  );
}
