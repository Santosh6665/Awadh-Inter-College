
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import type { Teacher, SalaryPayment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Eye, Loader2 } from 'lucide-react';
import { SalarySlipDialog } from '@/app/admin/dashboard/salary/salary-slip-dialog';
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

interface SalaryViewProps {
    teacher: Teacher;
}

export function SalaryView({ teacher }: SalaryViewProps) {
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
          description: "Could not fetch salary data for the selected month.",
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
  
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      value: i.toString(),
      label: format(date, 'MMMM'),
    };
  });

  const currentYear = getYear(new Date());
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear + 3 - i;
    return { value: year.toString(), label: year.toString() };
  });

  const salaryDetailsForMonth = useMemo(() => {
    return calculateSalary(teacher, currentMonth, attendance, holidays);
  }, [teacher, currentMonth, attendance, holidays]);

  const selectedMonthStr = format(currentMonth, 'yyyy-MM');
  const paymentForMonth = (teacher.salaryPayments || []).find(p => p.month === selectedMonthStr);
  const status = paymentForMonth ? 'paid' : 'pending';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='w-full'>
                <CardTitle>View Salary Slip</CardTitle>
                <CardDescription>Select a month and year to view your calculated salary and generate a slip.</CardDescription>
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
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center rounded-lg border p-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Net Salary for {format(currentMonth, 'MMMM yyyy')}</p>
                    <p className="text-2xl font-bold">Rs{salaryDetailsForMonth.netSalary.toFixed(2)}</p>
                    <Badge variant={status === 'paid' ? 'secondary' : 'destructive'}>
                        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </div>
                <Button onClick={handleViewSlip} className="mt-4 sm:mt-0">
                    <Eye className="mr-2 h-4 w-4" />
                    View & Download Slip
                </Button>
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
