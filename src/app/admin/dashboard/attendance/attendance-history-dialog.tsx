
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { AttendanceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getMonth, getYear, startOfMonth } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttendanceHistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  personName: string | null;
  attendanceRecords: AttendanceRecord[];
}

export function AttendanceHistoryDialog({ isOpen, setIsOpen, personName, attendanceRecords }: AttendanceHistoryDialogProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthlyData = useMemo(() => {
    return attendanceRecords.reduce((acc, record) => {
      const date = new Date(record.date);
      // Ensure we are comparing dates correctly without timezone issues
      const dateKey = format(new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000), 'yyyy-MM-dd');
      acc[dateKey] = record.status;
      return acc;
    }, {} as Record<string, 'present' | 'absent'>);
  }, [attendanceRecords]);

  const presentDays = useMemo(() => {
    return Object.entries(monthlyData)
        .filter(([date, status]) => 
            status === 'present' &&
            new Date(date).getMonth() === currentMonth.getMonth() &&
            new Date(date).getFullYear() === currentMonth.getFullYear()
        )
        .map(([date]) => new Date(date));
  }, [monthlyData, currentMonth]);
  
  const absentDays = useMemo(() => {
    return Object.entries(monthlyData)
        .filter(([date, status]) => 
            status === 'absent' &&
            new Date(date).getMonth() === currentMonth.getMonth() &&
            new Date(date).getFullYear() === currentMonth.getFullYear()
        )
        .map(([date]) => new Date(date));
  }, [monthlyData, currentMonth]);


  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const monthSummary = useMemo(() => {
    const present = presentDays.length;
    const absent = absentDays.length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, total, percentage };
  }, [presentDays, absentDays]);


  if (!personName) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance History for {personName}</DialogTitle>
          <DialogDescription>
            Viewing attendance for {format(currentMonth, 'MMMM yyyy')}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</div>
            <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        <Calendar
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={{
            present: presentDays,
            absent: absentDays,
          }}
          modifiersClassNames={{
            present: 'bg-green-200 text-green-800 rounded-full',
            absent: 'bg-red-200 text-red-800 rounded-full',
          }}
          className="rounded-md border"
        />
        <div className="mt-4 space-y-2 text-sm">
            <div className='flex justify-between items-center'>
                <p><strong>Monthly Summary:</strong></p>
                <Badge>
                    Attendance: {monthSummary.percentage.toFixed(2)}%
                </Badge>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-200" />
                    <span>Present: {monthSummary.present} days</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-red-200" />
                    <span>Absent: {monthSummary.absent} days</span>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
