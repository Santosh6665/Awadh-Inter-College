'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import { Search, Edit, PlusCircle, Eye, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { UpdateFeeStructureForm } from './update-fee-structure-form';
import { RecordPaymentForm } from './record-payment-form';
import { FeeHistoryDialog } from './fee-history-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StudentFeeManagementProps {
  students: Student[];
  feeSettings: any;
}

// New component for the family group
function FamilyFeeGroup({ 
    family, 
    students, 
    feeSettings, 
    onEditFeeStructure, 
    onRecordPayment, 
    onViewHistory 
}: {
    family: string;
    students: Student[];
    feeSettings: any;
    onEditFeeStructure: (student: Student) => void;
    onRecordPayment: (student: Student) => void;
    onViewHistory: (student: Student) => void;
}) {
  const [isOpen, setIsOpen] = useState(() => students.some(student => calculateAnnualDue(student, feeSettings).due > 0));

  const familyDetails = useMemo(() => {
    const fatherName = students[0]?.fatherName || 'N/A';
    
    const allChildren = students
        .filter((s, index, self) => self.findIndex(c => c.rollNumber === s.rollNumber) === index)
        .map(s => s.name)
        .join(', ');

    const familyTotalDue = students.reduce((total, student) => {
        const { due } = calculateAnnualDue(student, feeSettings);
        return total + due;
    }, 0);

    return { fatherName, childrenCount: students.length, childrenNames: allChildren, familyTotalDue };
  }, [students, feeSettings]);

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => b.session.localeCompare(a.session));
  }, [students]);

  return (
    <Card className="mb-4">
        <CardHeader 
            className="p-4 flex flex-row items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex items-center gap-4">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <div>
                    <h3 className="font-semibold text-lg">{familyDetails.fatherName}</h3>
                    <p className="text-sm text-muted-foreground">
                        {family} | {familyDetails.childrenNames} ({familyDetails.childrenCount} children)
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">Family Balance Due <Users className="h-4 w-4" /></p>
                <p className={cn("text-2xl font-bold", familyDetails.familyTotalDue > 0 ? 'text-destructive' : 'text-green-600')}>
                    Rs{familyDetails.familyTotalDue.toFixed(2)}
                </p>
            </div>
        </CardHeader>

        {isOpen && (
            <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Child Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Annual Fee</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Total Dues</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStudents.map(student => {
                                const { due, totalAnnualFee, totalPaid } = calculateAnnualDue(student, feeSettings);
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{`${student.class}-${student.section}`}</TableCell>
                                        <TableCell><Badge variant="secondary">{student.session}</Badge></TableCell>
                                        <TableCell>Rs{totalAnnualFee.toFixed(2)}</TableCell>
                                        <TableCell>Rs{totalPaid.toFixed(2)}</TableCell>
                                        <TableCell className={due > 0 ? 'text-destructive font-semibold' : ''}>Rs{due.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={due > 0 ? 'destructive' : 'default'} className={cn(due <= 0 && 'bg-green-600')}>{due > 0 ? 'Pending' : 'Paid'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" title="View Details" onClick={() => onViewHistory(student)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Edit Fee Structure" onClick={() => onEditFeeStructure(student)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Record Payment" onClick={() => onRecordPayment(student)}>
                                                <PlusCircle className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        )}
    </Card>
  );
}

export function StudentFeeManagement({ students, feeSettings }: StudentFeeManagementProps) {
  const [isFeeStructureFormOpen, setIsFeeStructureFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [historyDialogSession, setHistoryDialogSession] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  const handleEditFeeStructure = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsFeeStructureFormOpen(true);
  }, []);

  const handleRecordPayment = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsPaymentFormOpen(true);
  }, []);
  
  const handleViewHistory = useCallback((student: Student) => {
    setSelectedStudent(student);
    setHistoryDialogSession(student.session);
    setIsHistoryDialogOpen(true);
  }, []);

  const groupedStudents = useMemo(() => {
    const filtered = students.filter(student => {
        const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const fatherNameMatch = student.fatherName.toLowerCase().includes(searchQuery.toLowerCase());
        const mobileMatch = student.parentPhone?.includes(searchQuery);
        const classMatch = classFilter ? student.class === classFilter : true;
        const sectionMatch = sectionFilter ? student.section === sectionFilter : true;
        return (nameMatch || fatherNameMatch || mobileMatch) && classMatch && sectionMatch;
    });

    return filtered.reduce((acc, student) => {
      const key = student.parentPhone || `orphan_${student.id}`; // Group by mobile or use unique ID if mobile is missing
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(student);
      return acc;
    }, {} as Record<string, Student[]>);
  }, [students, searchQuery, classFilter, sectionFilter]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Manage Student Fees</CardTitle>
                <CardDescription>Grouped by family for your convenience. Click on a family to see individual details.</CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Student Name, Father Name, or Parent Mobile..."
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
                    {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}`}>{`Class ${i + 1}`}</SelectItem>
                    ))}
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
            {Object.keys(groupedStudents).length > 0 ? (
                Object.keys(groupedStudents).sort().map(familyId => (
                    <FamilyFeeGroup 
                        key={familyId}
                        family={familyId.startsWith('orphan_') ? groupedStudents[familyId][0].name : groupedStudents[familyId][0].parentPhone!}
                        students={groupedStudents[familyId]}
                        feeSettings={feeSettings}
                        onEditFeeStructure={handleEditFeeStructure}
                        onRecordPayment={handleRecordPayment}
                        onViewHistory={handleViewHistory}
                    />
                ))
            ) : (
                <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No students found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
            )}
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
        feeSettings={feeSettings}
      />
      
      <FeeHistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        student={selectedStudent}
        feeSettings={feeSettings}
        selectedSession={historyDialogSession}
      />
    </>
  );
}
