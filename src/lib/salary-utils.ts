
import type { Teacher } from './types';
import { getDaysInMonth, format } from 'date-fns';

export interface SalaryDetails {
  totalDaysInMonth: number;
  absentDays: number;
  holidayDays: number;
  presentDays: number;
  totalPresentDays: number;
  allowedAbsents: number;
  deductionDays: number;
  perDaySalary: number;
  deductionAmount: number;
  netSalary: number;
}

export function calculateSalary(
  teacher: Teacher,
  month: Date,
  allAttendance: { [teacherId: string]: { [date: string]: 'present' | 'absent' } },
  holidays: string[]
): SalaryDetails {
  const baseSalary = teacher.baseSalary || 0;
  // Rule: Per-day salary is always base salary divided by 30.
  const perDaySalary = baseSalary / 30;
  // Rule: 1 absent day is allowed without deduction.
  const allowedAbsents = 1;

  const teacherAttendance = allAttendance[teacher.id] || {};
  const holidaySet = new Set(holidays);
  
  const actualDaysInMonth = getDaysInMonth(month);
  let absentDays = 0;
  let presentDays = 0;
  
  // Rule: Absences are counted on any day of the month if marked.
  // Iterate through the month to calculate all metrics in one go.
  for (let i = 1; i <= actualDaysInMonth; i++) {
    const date = new Date(month.getFullYear(), month.getMonth(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 for Sunday
    const attendanceStatus = teacherAttendance[dateStr];

    if (attendanceStatus === 'absent') {
      absentDays++;
    } else if (attendanceStatus === 'present') {
      presentDays++;
    } 
  }

  const totalPayableDays = Math.min(31 - absentDays, 30);

  // Rule: Deduction applies for absent days exceeding the allowed limit.
  const deductionDays = Math.max(0, absentDays - allowedAbsents);
  const deductionAmount = deductionDays * perDaySalary;
  
  // Rule: Final salary calculation.
  const netSalary = baseSalary - deductionAmount;
  
  return {
    totalDaysInMonth: actualDaysInMonth,
    absentDays,
    holidayDays: holidaySet.size,
    presentDays,
    totalPresentDays: totalPayableDays, // Updated payable days calculation
    allowedAbsents,
    deductionDays,
    perDaySalary: Math.round(perDaySalary * 100) / 100,
    deductionAmount: Math.round(deductionAmount * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}
