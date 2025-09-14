
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ReportsPage() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Download detailed reports for various aspects of the institution.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Academic Performance</CardTitle>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download Report</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate reports on student grades, class averages, and subject-wise performance.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Fee Collection</CardTitle>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download Report</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track fee payments, view outstanding dues, and generate financial summaries.
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Attendance Records</CardTitle>
               <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download Report</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Download monthly or yearly attendance sheets for classes and individual students.
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Admissions Report</CardTitle>
               <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download Report</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View statistics on new admissions, demographics, and application trends.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Key Metrics Overview</CardTitle>
          <CardDescription>
            A quick look at important institutional data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium">Overall Attendance</span>
                <span className="text-sm text-muted-foreground">94%</span>
              </div>
              <Progress value={94} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium">Fee Collection (This Month)</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} />
            </div>
             <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium">Average Academic Performance</span>
                <span className="text-sm text-muted-foreground">88% (Grade A)</span>
              </div>
              <Progress value={88} />
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
