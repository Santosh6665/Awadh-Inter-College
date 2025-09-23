
'use client';

import * as React from 'react';
import type { Student, ExamTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, TableFooter } from '@/components/ui/table';
import { calculateGrade, calculateCumulativeTotals, combineMarks, calculateCumulativePercentage } from '@/lib/result-utils';
import { Download, User, BookOpen, BarChart3, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS_BY_CLASS } from '@/lib/class-subjects';

interface ResultCardProps {
  student: Student;
  ranks: { [key in ExamTypes]?: number | null };
  settings: any;
}

export function ResultCard({ student, ranks, settings }: ResultCardProps) {
  const [examType, setExamType] = useState<ExamTypes>('annual');
  const resultVisibility = settings?.resultVisibility || { quarterly: false, halfYearly: false, annual: true };

  const handlePrintResult = () => {
    const printContent = document.getElementById('result-card-print-content');
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Result Card</title>');

        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
            } catch (e) {
              if (styleSheet.href) {
                return `<link rel="stylesheet" href="${styleSheet.href}">`;
              }
              return '';
            }
          })
          .join('\n');
          
        printWindow.document.write('<style>');
        printWindow.document.write(styles);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const visibleExams = Object.entries(resultVisibility)
    .filter(([, isVisible]) => isVisible)
    .map(([exam]) => exam as ExamTypes);

  const { marks: combinedStudentMarks, examCyclesWithMarks } = useMemo(() => combineMarks(student.marks, examType, visibleExams), [student.marks, examType, visibleExams]);
  const percentage = calculateCumulativePercentage(combinedStudentMarks, examCyclesWithMarks, student.class);
  const grade = calculateGrade(percentage);
  const totals = calculateCumulativeTotals(combinedStudentMarks, examCyclesWithMarks, student.class);
  const resultStatus = grade === 'F' ? 'Fail' : 'Pass';
  const hasMarks = combinedStudentMarks && Object.keys(combinedStudentMarks).length > 0 && examCyclesWithMarks.length > 0;
  const examTitle = examType.charAt(0).toUpperCase() + examType.slice(1);
  
  const subjectsForClass = useMemo(() => {
      return SUBJECTS_BY_CLASS[student.class as keyof typeof SUBJECTS_BY_CLASS] || [];
  }, [student.class]);
  
  const examCycles: ExamTypes[] = ['quarterly', 'halfYearly', 'annual'];

  const ResultCardContent = () => (
    <Card id="result-card" className="border-2 shadow-lg print-area">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo className="h-16 w-16" />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-primary">Awadh Inter College</h2>
              <p className="text-xs text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground mt-1">
                <Phone className="h-3 w-3" /> <span>+91 6393071946</span>
                <Mail className="h-3 w-3" /> <span>info@awadhcollege.edu</span>
              </div>
            </div>
          </div>
          <div className='flex gap-2 print-hidden self-start sm:self-center'>
              <Select value={examType} onValueChange={(value) => setExamType(value as ExamTypes)}>
                  <SelectTrigger className="w-full md:w-[150px] h-9">
                      <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                      {visibleExams.includes('quarterly') && <SelectItem value="quarterly">Quarterly</SelectItem>}
                      {visibleExams.includes('halfYearly') && <SelectItem value="halfYearly">Half-Yearly</SelectItem>}
                      {visibleExams.includes('annual') && <SelectItem value="annual">Annual</SelectItem>}
                  </SelectContent>
              </Select>
              <Button onClick={handlePrintResult} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
              </Button>
          </div>
        </div>
        <div className="text-center mt-2">
          <Badge variant="secondary" className="text-base font-bold tracking-wider">🎓 {examTitle} Exam Result Card</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasMarks ? (
          <>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Student Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                <div><strong>Name:</strong> {student.name}</div>
                <div><strong>Roll No.:</strong> {student.rollNumber}</div>
                <div><strong>Class/Section:</strong> {`${student.class}-${student.section}`}</div>
                <div><strong>Date of Birth:</strong> {new Date(student.dob).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</div>
                <div><strong>Father's Name:</strong> {student.fatherName}</div>
                <div><strong>Contact No.:</strong> {student.phone}</div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Academic Performance</h3>
              <Table className="[&_td]:p-2 [&_th]:p-2 text-xs">
                <TableHeader>
                    <TableRow>
                        <TableHead rowSpan={2} className="align-bottom text-center">Subject</TableHead>
                        {examCycles.filter(cycle => visibleExams.includes(cycle)).map(cycle => (
                            <TableHead key={cycle} colSpan={2} className="text-center border-l capitalize">{cycle.replace('Yearly', ' Yearly')}</TableHead>
                        ))}
                        <TableHead colSpan={2} className="text-center border-l bg-muted/50">Total</TableHead>
                    </TableRow>
                    <TableRow>
                        {examCycles.filter(cycle => visibleExams.includes(cycle)).map(cycle => (
                            <React.Fragment key={cycle}>
                                <TableHead className="text-center border-l">Obtained</TableHead>
                                <TableHead className="text-center">Max</TableHead>
                            </React.Fragment>
                        ))}
                        <TableHead className="text-center border-l bg-muted/50">Obtained</TableHead>
                        <TableHead className="text-center bg-muted/50">Max</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectsForClass.map(subject => {
                      const examsToCombine: ExamTypes[] = [];
                        switch (examType) {
                            case 'quarterly': if (visibleExams.includes('quarterly')) examsToCombine.push('quarterly'); break;
                            case 'halfYearly': if (visibleExams.includes('quarterly')) examsToCombine.push('quarterly'); if (visibleExams.includes('halfYearly')) examsToCombine.push('halfYearly'); break;
                            case 'annual': if (visibleExams.includes('quarterly')) examsToCombine.push('quarterly'); if (visibleExams.includes('halfYearly')) examsToCombine.push('halfYearly'); if (visibleExams.includes('annual')) examsToCombine.push('annual'); break;
                        }

                      const totalObtained = examsToCombine.reduce((acc, cycle) => acc + (student.marks?.[cycle]?.[subject.key] ?? 0), 0);
                      const totalMax = examsToCombine.filter(cycle => student.marks?.[cycle]?.[subject.key] != null).length * 100;

                      return (
                        <TableRow key={subject.key}>
                            <TableCell className="capitalize font-medium">{subject.label}</TableCell>
                            {examCycles.filter(cycle => visibleExams.includes(cycle)).map(cycle => {
                                const obtained = student.marks?.[cycle]?.[subject.key];
                                const max = obtained != null ? 100 : '-';
                                return (
                                    <React.Fragment key={cycle}>
                                        <TableCell className="text-center border-l">{obtained ?? '-'}</TableCell>
                                        <TableCell className="text-center">{max}</TableCell>
                                    </React.Fragment>
                                );
                            })}
                            <TableCell className="text-center border-l bg-muted/50 font-bold">{totalMax > 0 ? totalObtained : '-'}</TableCell>
                            <TableCell className="text-center bg-muted/50 font-semibold">{totalMax > 0 ? totalMax : '-'}</TableCell>
                        </TableRow>
                      )
                  })}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold bg-muted/50 text-base">
                        <TableCell>Grand Total</TableCell>
                        {examCycles.filter(cycle => visibleExams.includes(cycle)).map(cycle => {
                            const cycleObtained = subjectsForClass.reduce((acc, sub) => acc + (student.marks?.[cycle]?.[sub.key] ?? 0), 0);
                            const cycleMax = subjectsForClass.filter(sub => student.marks?.[cycle]?.[sub.key] != null).length * 100;
                            return (
                                <React.Fragment key={cycle}>
                                    <TableCell className="text-center border-l">{cycleMax > 0 ? cycleObtained : '-'}</TableCell>
                                    <TableCell className="text-center">{cycleMax > 0 ? cycleMax : '-'}</TableCell>
                                </React.Fragment>
                            );
                        })}
                         <TableCell className="text-center border-l">{totals.totalObtainedMarks}</TableCell>
                         <TableCell className="text-center">{totals.totalMaxMarks}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><strong>Percentage:</strong> <span className="font-mono">{percentage?.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><strong>Overall Grade:</strong> <span className="font-mono">{grade}</span></div>
                    <div className="flex justify-between"><strong>Class Rank:</strong> <span className="font-mono">{ranks[examType] ?? 'N/A'}</span></div>
                    <div className="flex justify-between"><strong>Result Status:</strong> <Badge className={cn(resultStatus === 'Pass' ? 'bg-green-600' : 'bg-red-600', 'text-white')}>{resultStatus === 'Pass' ? '✅ Pass' : '❌ Fail'}</Badge></div>
                    </div>
                </div>
            </div>
            <div className="pt-8">
              <h3 className="font-semibold text-lg mb-8 text-center flex items-center justify-center gap-2">🔖 Signatures</h3>
              <div className="flex justify-between text-center">
                <div>
                  <p className="border-t-2 border-dashed pt-2">Class Teacher</p>
                </div>
                <div>
                  <p className="border-t-2 border-dashed pt-2">Principal</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">Results are not currently available. Please check back later or contact the administration.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <ResultCardContent />
      <div className="hidden print-block">
        <div id="result-card-print-content">
          <ResultCardContent />
        </div>
      </div>
    </>
  );
}
