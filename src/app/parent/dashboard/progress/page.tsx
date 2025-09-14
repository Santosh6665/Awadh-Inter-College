
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const attendanceData = [
  { subject: 'Physics', percentage: 95 },
  { subject: 'Chemistry', percentage: 88 },
  { subject: 'Mathematics', percentage: 92 },
  { subject: 'English', percentage: 98 },
  { subject: 'Computer Science', percentage: 85 },
];

const results = [
  { subject: 'Physics', marks: 88, grade: 'A' },
  { subject: 'Chemistry', marks: 92, grade: 'A+' },
  { subject: 'Mathematics', marks: 76, grade: 'B+' },
  { subject: 'English', marks: 85, grade: 'A' },
  { subject: 'Computer Science', marks: 95, grade: 'A+' },
];

export default function AcademicProgressPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Monitor your child's grades, attendance, and performance for the mid-term exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Examination Results</h3>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Marks Obtained</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.subject}>
                  <TableCell className="font-medium">{result.subject}</TableCell>
                  <TableCell className="text-right">{result.marks}</TableCell>
                  <TableCell className="text-right">
                    <Badge>{result.grade}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
           <CardTitle>Attendance Record</CardTitle>
           <CardDescription>Subject-wise attendance for the current semester.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {attendanceData.map((item) => (
            <div key={item.subject}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{item.subject}</span>
                <span className="text-sm text-muted-foreground">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
