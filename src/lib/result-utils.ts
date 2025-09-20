
import type { Marks } from './types';

export function calculatePercentage(marks: Marks | undefined | null): number | null {
  if (!marks) {
    return null;
  }

  const subjects = Object.values(marks).filter(mark => typeof mark === 'number');
  if (subjects.length === 0) {
    return null;
  }

  const totalMarks = subjects.reduce((sum, mark) => sum + (mark || 0), 0);
  const totalSubjects = subjects.length;
  const maxMarksPerSubject = 100;

  return (totalMarks / (totalSubjects * maxMarksPerSubject)) * 100;
}

export function calculateGrade(percentage: number | null): string {
  if (percentage === null) {
    return 'N/A';
  }

  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
