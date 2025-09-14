
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, FileText } from 'lucide-react';
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>
       <Card>
          <CardHeader>
            <CardTitle>Announcements for Parents</CardTitle>
          </CardHeader>
          <CardContent>
             <p>Important announcements will be displayed here.</p>
          </CardContent>
        </Card>
    </div>
  );
}
