
import type { Marks } from './types';

export function calculatePercentage(marks: Marks | undefined | null): number | null {
  if (!marks) {
    return null;
  }

  const subjects = Object.entries(marks)
    .filter(([key, value]) => key !== 'remarks' && typeof value === 'number')
    .map(([, value]) => value as number);

  if (subjects.length === 0) {
    return null;
  }

  const totalMarks = subjects.reduce((sum, mark) => sum + (mark || 0), 0);
  const totalSubjects = subjects.length;
  const maxMarksPerSubject = 100;

  return (totalMarks / (totalSubjects * maxMarksPerSubject)) * 100;
}

export function calculateGrade(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  const marks = Math.round(value);

  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B+';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

export function calculateTotals(marks: Marks | undefined | null): { totalObtainedMarks: number, totalMaxMarks: number } {
  if (!marks) {
    return { totalObtainedMarks: 0, totalMaxMarks: 0 };
  }

  const subjects = Object.entries(marks)
    .filter(([key, value]) => key !== 'remarks' && typeof value === 'number')
    .map(([, value]) => value as number);
    
  const totalObtainedMarks = subjects.reduce((sum, mark) => sum + (mark || 0), 0);
  const totalMaxMarks = subjects.length * 100;

  return { totalObtainedMarks, totalMaxMarks };
}
