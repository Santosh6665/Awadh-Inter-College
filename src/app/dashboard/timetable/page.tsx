import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const timetableData = [
  { time: '09:00 - 10:00', monday: 'Physics', tuesday: 'Chemistry', wednesday: 'Mathematics', thursday: 'English', friday: 'Computer Sci' },
  { time: '10:00 - 11:00', monday: 'Chemistry', tuesday: 'Mathematics', wednesday: 'Physics', thursday: 'Computer Sci', friday: 'English' },
  { time: '11:00 - 11:30', monday: 'Break', tuesday: 'Break', wednesday: 'Break', thursday: 'Break', friday: 'Break' },
  { time: '11:30 - 12:30', monday: 'Mathematics', tuesday: 'Physics', wednesday: 'English', thursday: 'Chemistry', friday: 'Physics Lab' },
  { time: '12:30 - 01:30', monday: 'English', tuesday: 'Computer Sci', wednesday: 'Chemistry Lab', thursday: 'Physics', friday: 'Mathematics' },
];

export default function TimetablePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Timetable</CardTitle>
        <CardDescription>Your weekly class schedule.</CardDescription>
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
