
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import type { Teacher, SalaryPayment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, Loader2, Banknote } from 'lucide-react';
import { SalarySlipDialog } from '../admin/dashboard/salary/salary-slip-dialog';
import { calculateSalary, SalaryDetails } from '@/lib/salary-utils';
import { getTeacherAttendanceForMonth, getHolidaysInMonth } from '../admin/dashboard/salary/actions';
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

export function TeacherSalaryView({ teacher }: { teacher: Teacher }) {
  const [isSlipDialogOpen, setIsSlipDialogOpen] = useState(false);
  const [selectedSalaryDetails, setSelectedSalaryDetails] = useState<SalaryDetails | null>(null);
  
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
  

  const handleViewSlip = () => {
    const salaryDetails = calculateSalary(teacher, currentMonth, attendance, holidays);
    setSelectedSalaryDetails(salaryDetails);
    setIsSlipDialogOpen(true);
  };
  
  const teacherWithSalary = useMemo(() => {
      const salaryDetails = calculateSalary(teacher, currentMonth, attendance, holidays);
      const selectedMonthStr = format(currentMonth, 'yyyy-MM');
      const paymentForMonth = (teacher.salaryPayments || []).find(p => p.month === selectedMonthStr);
      const status = paymentForMonth ? 'paid' : 'pending';
      return {
        ...teacher,
        ...salaryDetails,
        status,
        paymentForMonth,
      };
  }, [teacher, currentMonth, attendance, holidays]);

  
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>My Salary</CardTitle>
                <CardDescription>View your monthly salary details and download slips.</CardDescription>
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
        </CardHeader>
        <CardContent>
            {isPending ? (
                 <div className="flex items-center justify-center gap-2 h-24">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span>Loading salary data...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Base Salary</CardDescription>
                            <CardTitle className="text-2xl">Rs{teacherWithSalary.baseSalary?.toFixed(2) || '0.00'}</CardTitle>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Deductions</CardDescription>
                            <CardTitle className="text-2xl text-destructive">Rs{teacherWithSalary.deductionAmount.toFixed(2)}</CardTitle>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Net Salary</CardDescription>
                            <CardTitle className="text-2xl text-primary">Rs{teacherWithSalary.netSalary.toFixed(2)}</CardTitle>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                            <CardTitle>
                                <Badge variant={teacherWithSalary.status === 'paid' ? 'secondary' : 'destructive'} className="text-lg">
                                    {teacherWithSalary.status.charAt(0).toUpperCase() + teacherWithSalary.status.slice(1)}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="md:col-span-2 lg:col-span-4">
                        <CardContent className="p-4 flex items-center justify-center">
                             <Button size="lg" onClick={handleViewSlip}>
                                <Eye className="mr-2 h-5 w-5" />
                                View Full Salary Slip for {format(currentMonth, 'MMMM yyyy')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </CardContent>
      </Card>
      
      <SalarySlipDialog
        isOpen={isSlipDialogOpen}
        setIsOpen={setIsSlipDialogOpen}
        teacher={teacher}
        salaryDetails={selectedSalaryDetails}
        month={currentMonth}
      />
    </>
  );
}
