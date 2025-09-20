
'use client';

import { useState } from 'react';
import type { Teacher } from '@/lib/types';
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
import { SetSalaryForm } from './set-salary-form';
import { RecordPaymentForm } from './record-payment-form';

export function SalaryManagement({ teachers }: { teachers: Teacher[] }) {
  const [isSalaryFormOpen, setIsSalaryFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSetSalary = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsSalaryFormOpen(true);
  };

  const handleRecordPayment = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsPaymentFormOpen(true);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateSalaryStatus = (teacher: Teacher) => {
    const totalPaid = (teacher.salaryPayments || []).reduce((acc, p) => acc + p.amount, 0);
    // This is a simple calculation. A real system would track this monthly.
    // For now, we'll assume baseSalary is monthly and just show total paid against it.
    const baseSalary = teacher.baseSalary || 0;
    return { baseSalary, totalPaid };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Teacher Salaries</CardTitle>
          <CardDescription>Set base salaries and record payments for teachers.</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => {
                    const { baseSalary, totalPaid } = calculateSalaryStatus(teacher);
                    return (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{teacher.subject}</TableCell>
                        <TableCell>₹{baseSalary.toFixed(2)}</TableCell>
                        <TableCell>₹{totalPaid.toFixed(2)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" title="Set Base Salary" onClick={() => handleSetSalary(teacher)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Record Payment" onClick={() => handleRecordPayment(teacher)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No teachers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SetSalaryForm
        isOpen={isSalaryFormOpen}
        setIsOpen={setIsSalaryFormOpen}
        teacher={selectedTeacher}
      />
      
      <RecordPaymentForm
        isOpen={isPaymentFormOpen}
        setIsOpen={setIsPaymentFormOpen}
        teacher={selectedTeacher}
      />
    </>
  );
}
