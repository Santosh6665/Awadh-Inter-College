
import type { Teacher } from './types';
import { getDaysInMonth, isSameDay, parseISO, format } from 'date-fns';

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
  const totalDaysInMonth = 30; // Fixed as per requirement
  const perDaySalary = baseSalary / totalDaysInMonth;
  const allowedAbsents = 1;

  const teacherAttendance = allAttendance[teacher.id] || {};
  const holidaySet = new Set(holidays);
  
  const actualDaysInMonth = getDaysInMonth(month);
  let absentDays = 0;
  let presentDays = 0;
  let holidayDays = 0;

  for (let i = 1; i <= actualDaysInMonth; i++) {
    const date = new Date(month.getFullYear(), month.getMonth(), i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Ignore Sundays (day 0)
    if (date.getDay() === 0) continue;

    // Prioritize holidays: if it's a holiday, count it and skip other checks
    if (holidaySet.has(dateStr)) {
      holidayDays++;
      continue;
    }

    if (teacherAttendance[dateStr] === 'absent') {
      absentDays++;
    } else if (teacherAttendance[dateStr] === 'present') {
      presentDays++;
    }
  }

  const totalPresentDays = presentDays + holidayDays;
  const deductionDays = Math.max(0, absentDays - allowedAbsents);
  const deductionAmount = deductionDays * perDaySalary;
  const netSalary = baseSalary - deductionAmount;

  return {
    totalDaysInMonth,
    absentDays,
    holidayDays,
    presentDays,
    totalPresentDays,
    allowedAbsents,
    deductionDays,
    perDaySalary,
    deductionAmount: Math.round(deductionAmount * 100) / 100, // Round to 2 decimal places
    netSalary: Math.round(netSalary * 100) / 100, // Round to 2 decimal places
  };
}
