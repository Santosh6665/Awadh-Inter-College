
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import type { Teacher, SalaryPayment } from '@/lib/types';
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
import { Search, Eye, Loader2, Banknote } from 'lucide-react';
import { SalarySlipDialog } from './salary-slip-dialog';
import { calculateSalary, SalaryDetails } from '@/lib/salary-utils';
import { getHolidaysInMonth, getTeacherAttendanceForMonth } from './actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, getYear } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RecordSalaryPaymentForm } from './record-salary-payment-form';

type StatusFilter = 'all' | 'paid' | 'pending';

export function SalaryManagement({ teachers }: { teachers: Teacher[] }) {
  const [isSlipDialogOpen, setIsSlipDialogOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedSalaryDetails, setSelectedSalaryDetails] = useState<SalaryDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<any>({});
  const [holidays, setHolidays] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startTransition(async () => {
      try {
        const [newAttendance, newHolidays] = await Promise.all([
          getTeacherAttendanceForMonth(currentMonth),
          getHolidaysInMonth(currentMonth),
        ]);
        setAttendance(newAttendance);
        setHolidays(newHolidays);
      } catch (error) {
        console.error("Failed to fetch salary data:", error);
        toast({
          title: "Error",
          description: "Could not fetch attendance and holiday data for the selected month.",
          variant: "destructive",
        });
      }
    });
  }, [currentMonth, toast]);
  
  const handleRecordPayment = (teacher: Teacher) => {
    const salaryDetails = calculateSalary(teacher, currentMonth, attendance, holidays);
    setSelectedTeacher(teacher);
    setSelectedSalaryDetails(salaryDetails);
    setIsPaymentFormOpen(true);
  };

  const handleViewSlip = (teacher: Teacher) => {
    const salaryDetails = calculateSalary(teacher, currentMonth, attendance, holidays);
    setSelectedTeacher(teacher);
    setSelectedSalaryDetails(salaryDetails);
    setIsSlipDialogOpen(true);
  };
  
  const teachersWithSalary = useMemo(() => {
    const selectedMonthStr = format(currentMonth, 'yyyy-MM');
    return teachers.map(teacher => {
      const salaryDetails = calculateSalary(teacher, currentMonth, attendance, holidays);
      const paymentForMonth = (teacher.salaryPayments || []).find(p => p.month === selectedMonthStr);
      const status = paymentForMonth ? 'paid' : 'pending';
      return {
        ...teacher,
        ...salaryDetails,
        status,
        paymentForMonth,
      };
    });
  }, [teachers, currentMonth, attendance, holidays]);
  
  const filteredTeachers = useMemo(() => {
    return teachersWithSalary.filter(teacher => {
        const nameMatch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
        const statusMatch = statusFilter === 'all' || teacher.status === statusFilter;
        return nameMatch && statusMatch;
    });
  }, [teachersWithSalary, searchQuery, statusFilter]);

  
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      value: i.toString(),
      label: format(date, 'MMMM'),
    };
  });

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = getYear(new Date()) - i;
    return { value: year.toString(), label: year.toString() };
  });
  
  const totalMonthlySalaryExpense = useMemo(() => {
    return filteredTeachers.reduce((total, teacher) => {
      return total + teacher.netSalary;
    }, 0);
  }, [filteredTeachers]);


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>Teacher Salary Management</CardTitle>
                <CardDescription>Calculate monthly salaries and generate slips for teachers.</CardDescription>
            </div>
             <div className="flex gap-2 w-full md:w-auto">
                <Select
                    value={currentMonth.getMonth().toString()}
                    onValueChange={(month) => {
                        const newDate = new Date(currentMonth);
                        newDate.setMonth(parseInt(month, 10));
                        setCurrentMonth(newDate);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select
                    value={getYear(currentMonth).toString()}
                    onValueChange={(year) => {
                        const newDate = new Date(currentMonth);
                        newDate.setFullYear(parseInt(year, 10));
                        setCurrentMonth(newDate);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {yearOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by teacher name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
              <strong>Total Salary Expense for {format(currentMonth, 'MMMM yyyy')}:</strong> 
              {isPending 
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <span className="font-bold text-lg text-primary"> Rs{totalMonthlySalaryExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              }
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                   <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span>Loading salary data...</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-xs text-muted-foreground">{teacher.employeeId}</div>
                        </TableCell>
                        <TableCell className="font-semibold">Rs{teacher.netSalary.toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={teacher.status === 'paid' ? 'secondary' : 'destructive'}>
                                {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            {teacher.status === 'pending' ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => handleViewSlip(teacher)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Slip
                                    </Button>
                                    <Button size="sm" onClick={() => handleRecordPayment(teacher)}>
                                        <Banknote className="mr-2 h-4 w-4" />
                                        Pay
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => handleViewSlip(teacher)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Slip
                                </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No teachers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RecordSalaryPaymentForm
        isOpen={isPaymentFormOpen}
        setIsOpen={setIsPaymentFormOpen}
        teacher={selectedTeacher}
        netSalary={selectedSalaryDetails?.netSalary || 0}
        month={currentMonth}
      />
      
      <SalarySlipDialog
        isOpen={isSlipDialogOpen}
        setIsOpen={setIsSlipDialogOpen}
        teacher={selectedTeacher}
        salaryDetails={selectedSalaryDetails}
        month={currentMonth}
      />
    </>
  );
}
