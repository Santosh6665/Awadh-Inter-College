
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const results = [
  { subject: 'Physics', marks: 88, grade: 'A' },
  { subject: 'Chemistry', marks: 92, grade: 'A+' },
  { subject: 'Mathematics', marks: 76, grade: 'B+' },
  { subject: 'English', marks: 85, grade: 'A' },
  { subject: 'Computer Science', marks: 95, grade: 'A+' },
];

export default function ResultsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Examination Results</CardTitle>
        <CardDescription>Mid-Term Examination Results - Class XII</CardDescription>
      </CardHeader>
      <CardContent>
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
  );
}
