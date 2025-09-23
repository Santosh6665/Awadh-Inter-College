
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { AttendanceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameMonth, isSameYear } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { getHolidays } from '@/app/admin/dashboard/notices/actions';

interface AttendanceHistoryProps {
  attendanceRecords: AttendanceRecord[];
}

export function AttendanceHistory({ attendanceRecords }: AttendanceHistoryProps) {
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>(undefined);
  const [holidays, setHolidays] = useState<string[]>([]);

  useEffect(() => {
    setCurrentMonth(new Date());
    getHolidays().then(setHolidays);
  }, []);

  const filteredAttendanceRecords = useMemo(() => {
    const holidaySet = new Set(holidays);
    return attendanceRecords.filter(record => !holidaySet.has(record.date));
  }, [attendanceRecords, holidays]);

  const monthlyData = useMemo(() => {
    return filteredAttendanceRecords.reduce((acc, record) => {
      const date = new Date(record.date);
      // Ensure we are comparing dates correctly without timezone issues
      const dateKey = format(new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000), 'yyyy-MM-dd');
      acc[dateKey] = record.status;
      return acc;
    }, {} as Record<string, 'present' | 'absent'>);
  }, [filteredAttendanceRecords]);

  const presentDays = useMemo(() => {
    if (!currentMonth) return [];
    return Object.entries(monthlyData)
        .filter(([date, status]) => 
            status === 'present' &&
            new Date(date).getMonth() === currentMonth.getMonth() &&
            new Date(date).getFullYear() === currentMonth.getFullYear()
        )
        .map(([date]) => new Date(date));
  }, [monthlyData, currentMonth]);
  
  const absentDays = useMemo(() => {
    if (!currentMonth) return [];
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
      if (!prev) return new Date();
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (!prev) return new Date();
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const monthSummary = useMemo(() => {
    if (!currentMonth) return { present: 0, absent: 0, total: 0, percentage: 0, holidays: 0 };
    const present = presentDays.length;
    const absent = absentDays.length;
    const monthlyHolidays = holidays.filter(h => {
        const holidayDate = new Date(h);
        return isSameMonth(holidayDate, currentMonth) && isSameYear(holidayDate, currentMonth);
    }).length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, total, percentage, holidays: monthlyHolidays };
  }, [presentDays, absentDays, holidays, currentMonth]);
  
  const totalAttendancePercentage = useMemo(() => {
    if (filteredAttendanceRecords.length === 0) return '0.00%';
    const totalPresent = filteredAttendanceRecords.filter(r => r.status === 'present').length;
    return `${((totalPresent / filteredAttendanceRecords.length) * 100).toFixed(2)}%`;
  }, [filteredAttendanceRecords]);

  if (!currentMonth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Record</CardTitle>
          <CardDescription>Your attendance history for the current session.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading calendar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col md:flex-row items-center justify-between'>
          <div>
            <CardTitle>Attendance Record</CardTitle>
            <CardDescription>Your attendance history for the current session.</CardDescription>
          </div>
          <Badge className="mt-2 md:mt-0">Overall: {totalAttendancePercentage}</Badge>
        </div>
      </CardHeader>
      <CardContent>
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
          className="rounded-md border mt-4"
        />
        <div className="mt-4 space-y-2 text-sm">
            <div className='flex justify-between items-center'>
                <p><strong>Monthly Summary:</strong></p>
                <Badge>
                    Attendance: {monthSummary.percentage.toFixed(2)}%
                </Badge>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-200" />
                    <span>Present: {monthSummary.present} days</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-red-200" />
                    <span>Absent: {monthSummary.absent} days</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-yellow-200" />
                    <span>Holidays: {monthSummary.holidays} days</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
