
import type { Marks, ExamTypes } from './types';
import { SUBJECTS_BY_CLASS } from './class-subjects';


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

// New cumulative calculation logic
export function combineMarks(
  allMarks: { [key in ExamTypes]?: Marks } | undefined,
  examType: ExamTypes
): { marks: Marks | null, examCyclesWithMarks: ExamTypes[] } {
  const combined: Marks = {};
  const examsToCombine: ExamTypes[] = [];
  const examCyclesWithMarks: ExamTypes[] = [];


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
  
  examsToCombine.forEach(cycle => {
    if (allMarks?.[cycle] && Object.values(allMarks[cycle]!).some(mark => mark != null)) {
      examCyclesWithMarks.push(cycle);
    }
  });

  const allSubjectKeys = Object.values(SUBJECTS_BY_CLASS).flat().map(s => s.key);
  const uniqueSubjectKeys = [...new Set(allSubjectKeys)];


  for (const subject of uniqueSubjectKeys) {
    let total = 0;
    let hasValue = false;
    for (const exam of examsToCombine) {
      const mark = allMarks?.[exam]?.[subject as keyof Marks];
      if (typeof mark === 'number') {
        total += mark;
        hasValue = true;
      }
    }
    if (hasValue) {
      combined[subject as keyof Marks] = total;
    }
  }

  return { marks: combined, examCyclesWithMarks };
}

export function calculateCumulativeTotals(
  marks: Marks | undefined | null,
  examCyclesWithMarks: ExamTypes[],
  className: string
): { totalObtainedMarks: number, totalMaxMarks: number } {
  if (!marks || !className) {
    return { totalObtainedMarks: 0, totalMaxMarks: 0 };
  }

  const subjectsForClass = SUBJECTS_BY_CLASS[className as keyof typeof SUBJECTS_BY_CLASS] || [];
  const subjectKeysForClass = subjectsForClass.map(s => s.key);

  const subjects = Object.entries(marks)
    .filter(([key, value]) => subjectKeysForClass.includes(key as keyof Marks) && typeof value === 'number');

  const totalObtainedMarks = subjects.reduce((sum, [, mark]) => sum + (mark as number || 0), 0);
  
  const totalMaxMarks = subjectKeysForClass.length * 100 * examCyclesWithMarks.length;

  return { totalObtainedMarks, totalMaxMarks };
}


export function calculateCumulativePercentage(
  marks: Marks | undefined | null,
  examCyclesWithMarks: ExamTypes[],
  className: string
): number | null {
  const { totalObtainedMarks, totalMaxMarks } = calculateCumulativeTotals(marks, examCyclesWithMarks, className);
  
  if (totalMaxMarks === 0) {
    return null;
  }
  
  return (totalObtainedMarks / totalMaxMarks) * 100;
}
