
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
        <CardDescription>View and manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://picsum.photos/seed/student/200" alt="Student Name" data-ai-hint="student portrait" />
            <AvatarFallback>SN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Student Name</h2>
            <p className="text-muted-foreground">Class XII - Section A</p>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-2">
            <span className="font-semibold">Roll Number:</span>
            <span>101</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold">Date of Birth:</span>
            <span>January 1, 2008</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold">Email:</span>
            <span>student@example.com</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-semibold">Phone:</span>
            <span>+91 12345 67890</span>
          </div>
           <div className="grid grid-cols-2">
            <span className="font-semibold">Father's Name:</span>
            <span>Father's Name</span>
          </div>
           <div className="grid grid-cols-2">
            <span className="font-semibold">Address:</span>
            <span>123, College Road, City, State</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
