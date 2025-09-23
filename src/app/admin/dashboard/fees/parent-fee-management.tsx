
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
import { Search, PlusCircle, ChevronsUpDown, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { RecordCombinedPaymentForm } from './record-combined-payment-form';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CombinedFeeHistoryDialog } from './combined-fee-history-dialog';
import { calculateAnnualDue } from '@/lib/fee-utils';

interface ParentFeeManagementProps {
  students: Student[];
  feeSettings: any;
}

export function ParentFeeManagement({ students, feeSettings }: ParentFeeManagementProps) {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const handleRecordPayment = (parent: Parent) => {
    setSelectedParent(parent);
    setIsPaymentFormOpen(true);
  };
  
  const handleViewHistory = (parent: Parent) => {
    setSelectedParent(parent);
    setIsHistoryDialogOpen(true);
  };

  const parentsData = useMemo<Parent[]>(() => {
    const parentsMap: Record<string, { parentName: string, children: Student[] }> = {};
    students.forEach(student => {
        if (student.parentPhone) {
            if (!parentsMap[student.parentPhone]) {
                parentsMap[student.parentPhone] = { parentName: student.fatherName, children: [] };
            }
            parentsMap[student.parentPhone].children.push(student);
        }
    });

    return Object.entries(parentsMap).map(([phone, data]) => {
      let totalFees = 0;
      let totalPaid = 0;
      let totalDue = 0;

      data.children.forEach((child, index) => {
        const isSibling = index > 0;
        const { due, totalAnnualFee, paid } = calculateAnnualDue(child, feeSettings, isSibling);
        totalDue += due;
        totalFees += totalAnnualFee;
        totalPaid += paid;
      });

      return {
        id: phone,
        parentName: data.parentName,
        children: data.children.sort((a,b) => a.name.localeCompare(b.name)),
        totalFees,
        totalPaid,
        totalDue,
      };
    });
  }, [students, feeSettings]);

  const filteredParents = parentsData.filter(parent =>
    parent.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.id.includes(searchQuery)
  );


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Fees by Parent</CardTitle>
          <CardDescription>View family-wise fee summaries and record combined payments.</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by parent name or phone..."
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
                    <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center gap-4">
                                {openCollapsibles.includes(parent.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                <div>
                                    <h4 className="text-lg font-semibold">{parent.parentName}</h4>
                                    <p className="text-sm text-muted-foreground">{parent.id} ({parent.children.length} children)</p>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Balance Due</p>
                                <p className="text-xl font-bold text-destructive">Rs{parent.totalDue.toFixed(2)}</p>
                            </div>
                             <Button size="sm" variant="outline" onClick={() => handleViewHistory(parent)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Summary
                            </Button>
                            <Button size="sm" onClick={() => handleRecordPayment(parent)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Combined Payment
                            </Button>
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
                    <p className="text-sm">Ensure students have a 'Parent's Primary Phone' set in their profile to link them.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <RecordCombinedPaymentForm
        isOpen={isPaymentFormOpen}
        setIsOpen={setIsPaymentFormOpen}
        parent={selectedParent}
      />

      <CombinedFeeHistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        parent={selectedParent}
        feeSettings={feeSettings}
      />
    </>
  );
}
