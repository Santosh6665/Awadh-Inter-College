
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, FileText, BarChart2, Library, Bus } from 'lucide-react';
import Link from 'next/link';

const overviewItems = [
    { title: "Total Students", value: "1250", description: "students enrolled", icon: Users, href: "/admin/dashboard/students" },
    { title: "Total Teachers", value: "75", description: "teachers on staff", icon: UserPlus, href: "/admin/dashboard/teachers" },
    { title: "Fees Collected", value: "₹5.2L", description: "this month", icon: FileText, href: "/admin/dashboard/fees" },
    { title: "Overall Results", value: "92.5%", description: "pass percentage", icon: BarChart2, href: "/admin/dashboard/results" },
    { title: "Library Books", value: "5,420", description: "books available", icon: Library, href: "/admin/dashboard/library" },
    { title: "Transport Routes", value: "12", description: "buses in operation", icon: Bus, href: "/admin/dashboard/transport" },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewItems.map((item) => (
               <Link href={item.href} key={item.title}>
                <Card className="hover:bg-muted/50 transition-colors h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                </Card>
               </Link>
            ))}
             <Card className="lg:col-span-4 hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Generate Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Create and download detailed reports for admissions, financials, and academic performance.
                    </p>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
