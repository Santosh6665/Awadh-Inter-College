
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const attendanceData = [
  { subject: 'Physics', percentage: 95 },
  { subject: 'Chemistry', percentage: 88 },
  { subject: 'Mathematics', percentage: 92 },
  { subject: 'English', percentage: 98 },
  { subject: 'Computer Science', percentage: 85 },
];

export default function AttendancePage() {
  return (
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
  );
}
