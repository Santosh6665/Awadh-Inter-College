
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const timetableData = [
  { time: '09:00 - 10:00', monday: 'Class XII-A (Physics)', tuesday: 'Class XI-B (Physics)', wednesday: 'Class XII-A (Physics)', thursday: 'Class XI-A (Physics)', friday: 'Class XII-B (Lab)' },
  { time: '10:00 - 11:00', monday: 'Class XI-A (Physics)', tuesday: 'Class XII-B (Physics)', wednesday: 'Class XI-A (Physics)', thursday: 'Class XII-A (Physics)', friday: 'Class XI-B (Lab)' },
  { time: '11:00 - 11:30', monday: 'Break', tuesday: 'Break', wednesday: 'Break', thursday: 'Break', friday: 'Break' },
  { time: '11:30 - 12:30', monday: 'Class XII-B (Physics)', tuesday: 'Class XI-A (Physics)', wednesday: 'Free Period', thursday: 'Class XII-B (Physics)', friday: 'Free Period' },
  { time: '12:30 - 01:30', monday: 'Free Period', tuesday: 'Class XII-A (Physics)', wednesday: 'Class XI-B (Physics)', thursday: 'Free Period', friday: 'Class XI-A (Lab)' },
];

export default function TeacherTimetablePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Timetable</CardTitle>
        <CardDescription>Your weekly teaching schedule.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Monday</TableHead>
              <TableHead>Tuesday</TableHead>
              <TableHead>Wednesday</TableHead>
              <TableHead>Thursday</TableHead>
              <TableHead>Friday</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timetableData.map((row) => (
              <TableRow key={row.time}>
                <TableCell className="font-medium">{row.time}</TableCell>
                <TableCell>{row.monday}</TableCell>
                <TableCell>{row.tuesday}</TableCell>
                <TableCell>{row.wednesday}</TableCell>
                <TableCell>{row.thursday}</TableCell>
                <TableCell>{row.friday}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
