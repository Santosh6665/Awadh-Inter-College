
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, FileText, MessageSquare, Bell } from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboardPage() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Parent!</CardTitle>
          <CardDescription>
            Here is a quick overview of your child's information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/parent/dashboard/progress">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Academic Progress</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">Overall grade</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/parent/dashboard/fees">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fee Payment</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,250</div>
                  <p className="text-xs text-muted-foreground">Due by 30th August</p>
                </CardContent>
              </Card>
            </Link>
             <Link href="/parent/dashboard/contact">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Teachers</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground pt-3">
                    Have questions? Send a message directly to your child's teachers.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2 text-sm list-disc list-inside">
                <li>
                    <span className="font-semibold">Fee Reminder:</span> The tuition fee for September is due by the 10th.
                </li>
                <li>
                    <span className="font-semibold">Results Published:</span> Mid-term examination results are now available to view.
                </li>
             </ul>
          </CardContent>
        </Card>
    </div>
  );
}
