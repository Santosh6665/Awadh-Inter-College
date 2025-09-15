
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, FileText, BarChart2, Library, Bus, FilePieChart } from 'lucide-react';
import Link from 'next/link';

const overviewItems = [
    { title: "Manage Students", value: "1250", description: "Enrolled", icon: Users, href: "/admin/dashboard/students" },
    { title: "Manage Teachers", value: "75", description: "On Staff", icon: UserPlus, href: "/admin/dashboard/teachers" },
    { title: "Manage Fees", value: "₹5.2L", description: "Collected This Month", icon: FileText, href: "/admin/dashboard/fees" },
    { title: "Manage Results", value: "92.5%", description: "Pass Percentage", icon: BarChart2, href: "/admin/dashboard/results" },
    { title: "Manage Library", value: "5,420", description: "Books Available", icon: Library, href: "/admin/dashboard/library" },
    { title: "Manage Transport", value: "12", description: "Buses in Operation", icon: Bus, href: "/admin/dashboard/transport" },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            Manage your institution from this central dashboard. Here is an overview of the key metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {overviewItems.map((item) => (
               <Link href={item.href} key={item.title} className="flex">
                <Card className="hover:bg-muted/50 transition-colors w-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">{item.title}</CardTitle>
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-2xl font-bold">{item.value}</div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                </Card>
               </Link>
            ))}
             <Link href="/admin/dashboard/reports" className="lg:col-span-3">
              <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FilePieChart className="h-5 w-5 text-muted-foreground" />
                        Generate Reports
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground">
                          Create and download detailed reports for admissions, financials, and academic performance.
                      </p>
                  </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
