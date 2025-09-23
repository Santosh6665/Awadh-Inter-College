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

interface ParentFeeManagementProps {
  students: Student[];
  feeSettings: any;
}

export function ParentFeeManagement({ students, feeSettings }: ParentFeeManagementProps) {
  const [isCombinedHistoryDialogOpen, setIsCombinedHistoryDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

  const [isFeeStructureFormOpen, setIsFeeStructureFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
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

  const parentsData = useMemo<Parent[]>(() => {
    const parentsMap: Record<string, { parentName: string, children: Student[] }> = {};
    students.forEach(student => {
      const parentId = student.parentPhone || `no-parent-${student.id}`;
      if (!parentsMap[parentId]) {
          parentsMap[parentId] = { parentName: student.fatherName, children: [] };
      }
      parentsMap[parentId].children.push(student);
    });

    return Object.entries(parentsMap).map(([phone, data]) => {
      const sortedChildren = [...data.children].sort((a,b) => new Date(a.dob!).getTime() - new Date(b.dob!).getTime());

      let totalFees = 0;
      let totalPaid = 0;
      let totalDue = 0;

      sortedChildren.forEach((child, index) => {
        const isSibling = index > 0;
        const { due, totalAnnualFee, paid } = calculateAnnualDue(child, feeSettings, isSibling);
        totalDue += due;
        totalFees += totalAnnualFee;
        totalPaid += paid;
      });

      return {
        id: phone,
        parentName: data.parentName,
        children: sortedChildren,
        totalFees,
        totalPaid,
        totalDue,
      };
    }).sort((a, b) => a.parentName.localeCompare(b.parentName));
  }, [students, feeSettings]);

  const filteredParents = parentsData.filter(parent =>
    parent.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.id.includes(searchQuery) ||
    parent.children.some(child => child.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Fee Management</CardTitle>
          <CardDescription>View family-wise fee summaries and record individual or combined payments.</CardDescription>
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
                                    <p className="text-sm text-muted-foreground">{parent.id} ({parent.children.length} children)</p>
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Child Name</TableHead>
                              <TableHead>Class</TableHead>
                              <TableHead>Total Dues</TableHead>
                              <TableHead>Annual Fee</TableHead>
                              <TableHead>Paid</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parent.children.map((child, index) => {
                                const isSibling = index > 0;
                                const { due, totalAnnualFee, totalPaid } = calculateAnnualDue(child, feeSettings, isSibling);
                                return (
                                <TableRow key={child.id}>
                                    <TableCell>{child.name}</TableCell>
                                    <TableCell>{`${child.class}-${child.section}`}</TableCell>
                                    <TableCell className={due > 0 ? 'text-destructive font-semibold' : ''}>Rs{due.toFixed(2)}</TableCell>
                                    <TableCell>Rs{totalAnnualFee.toFixed(2)}</TableCell>
                                    <TableCell>Rs{totalPaid.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={due > 0 ? 'destructive' : 'secondary'}>
                                            {due > 0 ? 'Pending' : 'Paid'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-0">
                                        <Button variant="ghost" size="icon" title="View Details" onClick={() => handleViewHistory(child)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Edit Fee Structure" onClick={() => handleEditFeeStructure(child)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Record Payment" onClick={() => handleRecordPayment(child)}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                          </TableBody>
                        </Table>
                        </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No parent records found.</p>
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
