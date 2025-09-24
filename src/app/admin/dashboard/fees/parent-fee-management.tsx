
'use client';

import { useState, useMemo } from 'react';
import type { Student, Parent } from '@/lib/types';
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
import { Search, PlusCircle, ChevronDown, ChevronUp, Eye, Edit, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CombinedFeeHistoryDialog } from './combined-fee-history-dialog';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { UpdateFeeStructureForm } from './update-fee-structure-form';
import { RecordPaymentForm } from './record-payment-form';
import { FeeHistoryDialog } from './fee-history-dialog';
import { RecordCombinedPaymentForm } from './record-combined-payment-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface ParentFeeManagementProps {
  students: Student[];
  feeSettings: any;
  selectedSession: string;
}

export function ParentFeeManagement({ students, feeSettings, selectedSession }: ParentFeeManagementProps) {
  const [isCombinedHistoryDialogOpen, setIsCombinedHistoryDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

  const [isFeeStructureFormOpen, setIsFeeStructureFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCombinedPaymentFormOpen, setIsCombinedPaymentFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  

  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const handleViewCombinedHistory = (parent: Parent) => {
    setSelectedParent(parent);
    setIsCombinedHistoryDialogOpen(true);
  };

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

   const handleRecordCombinedPayment = (parent: Parent) => {
    setSelectedParent(parent);
    setIsCombinedPaymentFormOpen(true);
  };

  const parentsData = useMemo<Parent[]>(() => {
    const parentsMap: Record<string, { parentName: string, children: Student[] }> = {};
    
    // First, filter all students to only include records up to and including the selected session
    const sessionRelevantStudents = students.filter(student => student.session <= selectedSession);
    
    sessionRelevantStudents.forEach(student => {
        const parentId = student.parentPhone || `no-parent-${student.id}`;
        if (!parentsMap[parentId]) {
            parentsMap[parentId] = { parentName: student.fatherName, children: [] };
        }
        parentsMap[parentId].children.push(student);
    });

    return Object.entries(parentsMap).map(([phone, data]) => {
        // For each family, find the latest record for each child *within the selected session context*
        const childrenForSession = Object.values(data.children.reduce((acc, child) => {
            if (child.session === selectedSession) {
                acc[child.rollNumber] = child;
            } else if (!acc[child.rollNumber] && child.session < selectedSession) {
                // If a student doesn't have a record for the selected session (e.g., they left),
                // we still want to show their last known record to see if they had dues.
                 acc[child.rollNumber] = child;
            }
            return acc;
        }, {} as Record<string, Student>));

        let totalFees = 0;
        let totalPaid = 0;
        let totalDue = 0;

        childrenForSession.forEach((child) => {
            const { due, totalAnnualFee, totalPaid: childTotalPaid } = calculateAnnualDue(child, feeSettings, selectedSession);
            totalDue += due;
            totalFees += totalAnnualFee;
            totalPaid += childTotalPaid;
        });

        // If no children are found for the selected session for this parent, don't include them.
        if (childrenForSession.length === 0) {
            return null;
        }

        return {
            id: phone,
            parentName: data.parentName,
            children: childrenForSession.sort((a, b) => a.name.localeCompare(b.name)),
            totalFees,
            totalPaid,
            totalDue,
        };
    }).filter(p => p !== null).sort((a, b) => a!.parentName.localeCompare(b!.parentName)) as Parent[];
  }, [students, feeSettings, selectedSession]);


  const filteredParents = parentsData.filter(parent =>
    parent.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.id.includes(searchQuery) ||
    parent.children.some(child => child.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Fee Management by Family</CardTitle>
          <CardDescription>View family-wise fee summaries and record individual or combined payments for session {selectedSession}.</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by parent name, phone, or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredParents.length > 0 ? (
              filteredParents.map(parent => (
                <Collapsible
                  key={parent.id}
                  open={openCollapsibles.includes(parent.id)}
                  onOpenChange={() => toggleCollapsible(parent.id)}
                  className="space-y-2"
                >
                  <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                        <CollapsibleTrigger asChild>
                           <div className="flex items-center gap-4 cursor-pointer w-full">
                                {openCollapsibles.includes(parent.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                <div>
                                    <h4 className="text-lg font-semibold">{parent.parentName}</h4>
                                    <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        <span>{parent.id}</span>
                                        <span className="hidden sm:inline-block">|</span>
                                        <span className="truncate max-w-xs">{parent.children.map(c => c.name).join(', ')} ({parent.children.length} children)</span>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Family Balance Due</p>
                                <p className="text-xl font-bold text-destructive">Rs{parent.totalDue.toFixed(2)}</p>
                            </div>
                             {parent.children.length > 1 && (
                                <Button variant="ghost" size="icon" title="View Family Summary" onClick={() => handleViewCombinedHistory(parent)}>
                                    <Users className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="p-4 pt-0">
                        <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Child Name</TableHead>
                              <TableHead>Class</TableHead>
                              <TableHead>Annual Fee</TableHead>
                              <TableHead>Previous Dues</TableHead>
                              <TableHead>Paid</TableHead>
                              <TableHead>Total Dues</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parent.children.map((child) => {
                                const { due, totalAnnualFee, totalPaid, previousSessionDue } = calculateAnnualDue(child, feeSettings, selectedSession);
                                const isLatestSession = child.session === selectedSession;

                                return (
                                <TableRow key={child.id}>
                                    <TableCell>{child.name}</TableCell>
                                    <TableCell>{`${child.class}-${child.section}`}</TableCell>
                                    <TableCell>Rs{totalAnnualFee.toFixed(2)}</TableCell>
                                    <TableCell className={previousSessionDue > 0 ? 'text-destructive' : ''}>Rs{previousSessionDue.toFixed(2)}</TableCell>
                                    <TableCell>Rs{totalPaid.toFixed(2)}</TableCell>
                                    <TableCell className={due > 0 ? 'text-destructive font-semibold' : ''}>Rs{due.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={due > 0 ? 'destructive' : 'secondary'}>
                                            {due > 0 ? 'Pending' : 'Paid'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-0">
                                        <Button variant="ghost" size="icon" title="View Details" onClick={() => handleViewHistory(child)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Edit Fee Structure" onClick={() => handleEditFeeStructure(child)} disabled={!isLatestSession}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Record Payment" onClick={() => handleRecordPayment(child)} disabled={!isLatestSession}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                          </TableBody>
                        </Table>
                        </div>
                         {parent.children.length > 1 && (
                            <div className="flex justify-end mt-4">
                                <Button onClick={() => handleRecordCombinedPayment(parent)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Record Combined Payment
                                </Button>
                            </div>
                        )}
                        </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No parent records found for the selected session.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <CombinedFeeHistoryDialog
        isOpen={isCombinedHistoryDialogOpen}
        setIsOpen={setIsCombinedHistoryDialogOpen}
        parent={selectedParent}
        feeSettings={feeSettings}
      />

       <RecordCombinedPaymentForm
        isOpen={isCombinedPaymentFormOpen}
        setIsOpen={setIsCombinedPaymentFormOpen}
        parent={selectedParent}
      />

      {/* Individual Student Modals */}
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
      />
    </>
  );
}
