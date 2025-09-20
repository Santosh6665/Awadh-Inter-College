
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, BookOpen, UserCheck } from "lucide-react";
import { StudentList } from "./students/student-list";
import { getStudents } from "./students/actions";
import { TeacherList } from "./teachers/teacher-list";
import { getTeachers } from "./teachers/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsManagement } from "./results/results-management";
import { AttendanceManagement } from "./attendance/attendance-management";
import type { Student, Teacher } from "@/lib/types";
import { firestore } from "@/lib/firebase-admin";
import { FeeManagement } from "./fees/fee-management";
import { FeeSettings } from "./fees/fee-settings";

export default async function AdminDashboardPage() {
  let students: Student[] = [];
  let teachers: Teacher[] = [];
  let feeStructures: any = {};

  // Only attempt to fetch data if firestore was successfully initialized
  if (firestore) {
    try {
      students = await getStudents();
      teachers = await getTeachers();
      const feeStructureDoc = await firestore.collection('settings').doc('feeStructure').get();
      if (feeStructureDoc.exists) {
        feeStructures = feeStructureDoc.data() || {};
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data at runtime:", error);
      // In case of an error at runtime, we still render the page with empty data
      // to avoid crashing the entire dashboard.
    }
  } else {
     console.warn("Firestore is not available. Skipping data fetch for Admin Dashboard. This is expected during the build process.");
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
             <p className="text-xs text-muted-foreground">
              Currently employed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fees Collected
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Library Books Issued
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="pt-8">
        <Tabs defaultValue="students">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="students">Manage Students</TabsTrigger>
            <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
            <TabsTrigger value="results">Result Management</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="fees">Fee Management</TabsTrigger>
            <TabsTrigger value="fee-settings">Fee Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="mt-4">
            <StudentList students={students} />
          </TabsContent>
          <TabsContent value="teachers" className="mt-4">
            <TeacherList teachers={teachers} />
          </TabsContent>
           <TabsContent value="results" className="mt-4">
            <ResultsManagement students={students} />
          </TabsContent>
          <TabsContent value="attendance" className="mt-4">
            <AttendanceManagement students={students} />
          </TabsContent>
           <TabsContent value="fees" className="mt-4">
            <FeeManagement students={students} feeSettings={feeStructures} />
          </TabsContent>
          <TabsContent value="fee-settings" className="mt-4">
            <FeeSettings initialData={feeStructures} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
