
import type { Marks, ExamTypes } from './types';

export function calculatePercentage(marks: Marks | undefined | null): number | null {
  if (!marks) {
    return null;
  }

  const subjects = Object.entries(marks)
    .filter(([key, value]) => typeof value === 'number')
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
    .filter(([key, value]) => typeof value === 'number')
    .map(([, value]) => value as number);
    
  const totalObtainedMarks = subjects.reduce((sum, mark) => sum + (mark || 0), 0);
  const totalMaxMarks = subjects.length * 100;

  return { totalObtainedMarks, totalMaxMarks };
}

// New cumulative calculation logic
const subjectKeys: (keyof Marks)[] = ['physics', 'chemistry', 'maths', 'english', 'computerScience'];

export function combineMarks(
  allMarks: { [key in ExamTypes]?: Marks } | undefined,
  examType: ExamTypes
): { marks: Marks | null } {
  const combined: Marks = {};
  const examsToCombine: ExamTypes[] = [];

  switch (examType) {
    case 'quarterly':
      examsToCombine.push('quarterly');
      break;
    case 'halfYearly':
      examsToCombine.push('quarterly', 'halfYearly');
      break;
    case 'annual':
      examsToCombine.push('quarterly', 'halfYearly', 'annual');
      break;
  }

  for (const subject of subjectKeys) {
    let total = 0;
    let hasValue = false;
    for (const exam of examsToCombine) {
      const mark = allMarks?.[exam]?.[subject];
      if (typeof mark === 'number') {
        total += mark;
        hasValue = true;
      }
    }
    if (hasValue) {
      combined[subject] = total;
    }
  }

  return { marks: combined };
}

export function calculateCumulativeTotals(
  marks: Marks | undefined | null,
  examType: ExamTypes
): { totalObtainedMarks: number, totalMaxMarks: number, subjectCount: number } {
  if (!marks) {
    return { totalObtainedMarks: 0, totalMaxMarks: 0, subjectCount: 0 };
  }

  const subjects = Object.entries(marks)
    .filter(([key, value]) => typeof value === 'number')
    .map(([, value]) => value as number);

  const totalObtainedMarks = subjects.reduce((sum, mark) => sum + (mark || 0), 0);
  
  let examMultiplier = 1;
  if (examType === 'halfYearly') examMultiplier = 2;
  if (examType === 'annual') examMultiplier = 3;

  const totalMaxMarks = subjects.length * 100 * examMultiplier;

  return { totalObtainedMarks, totalMaxMarks, subjectCount: subjects.length };
}

export function calculateCumulativePercentage(
  marks: Marks | undefined | null,
  examType: ExamTypes
): number | null {
  const { totalObtainedMarks, totalMaxMarks } = calculateCumulativeTotals(marks, examType);
  
  if (totalMaxMarks === 0) {
    return null;
  }
  
  return (totalObtainedMarks / totalMaxMarks) * 100;
}
