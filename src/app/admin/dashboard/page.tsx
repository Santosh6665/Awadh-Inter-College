'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, BookOpen, UserCheck } from "lucide-react";
import { StudentList } from "./students/student-list";
import { TeacherList } from "./teachers/teacher-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsManagement } from "./results/results-management";
import { AttendanceManagement } from "./attendance/attendance-management";
import type { Student, Teacher, Notice } from "@/lib/types";
import { StudentFeeManagement } from "./fees/student-fee-management";
import { NoticeManagement } from "./notices/notice-management";
import { format } from 'date-fns';
import { TeacherAttendanceManagement } from "./teacher-attendance/teacher-attendance-management";
import { SalaryManagement } from "./salary/salary-management";
import { Settings } from "./settings/settings";
import { StudentPromotion } from "./students/student-promotion";

interface AdminDashboardPageProps {
  students: Student[];
  teachers: Teacher[];
  settings: any;
  notices: Notice[];
  todayAttendanceData: any;
  yesterdayAttendanceData: any;
}


export default function AdminDashboardPage({ students, teachers, settings: initialSettings, notices, todayAttendanceData, yesterdayAttendanceData }: AdminDashboardPageProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [selectedSession, setSelectedSession] = useState(settings.activeSession || '');
  
  const studentsInSession = useMemo(() => students.filter(s => s.session === selectedSession), [students, selectedSession]);

  const totalFeesCollected = studentsInSession.reduce((acc, student) => {
    const studentTotal = (student.payments || []).reduce((paymentAcc, payment) => paymentAcc + payment.amount, 0);
    return acc + studentTotal;
  }, 0);

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  let feesLastMonth = 0;

  studentsInSession.forEach(student => {
    (student.payments || []).forEach(payment => {
      const paymentDate = new Date(payment.date);
      if (paymentDate >= startOfLastMonth && paymentDate < startOfCurrentMonth) {
        feesLastMonth += payment.amount;
      }
    });
  });
  
  const totalFeesCollectedSoFarThisMonth = studentsInSession.reduce((acc, student) => {
    return acc + (student.payments || [])
      .filter(p => new Date(p.date) >= startOfCurrentMonth)
      .reduce((sum, p) => sum + p.amount, 0);
  }, 0);


  let feesPercentageChangeText = '+0% from last month';
  if (feesLastMonth > 0) {
    const percentageChange = ((totalFeesCollectedSoFarThisMonth - feesLastMonth) / feesLastMonth) * 100;
     feesPercentageChangeText = `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}% from last month`;
  } else if (totalFeesCollectedSoFarThisMonth > 0) {
    feesPercentageChangeText = 'New collections this month';
  }

  // Calculate attendance percentages
  const totalStudents = studentsInSession.length;
  const presentToday = Object.values(todayAttendanceData).filter((att: any) => att.status === 'present').length;
  const recordedTodayCount = Object.keys(todayAttendanceData).length;
  const presentYesterday = Object.values(yesterdayAttendanceData).filter((att: any) => att.status === 'present').length;
  const recordedYesterdayCount = Object.keys(yesterdayAttendanceData).length;


  const todayAttendancePercentage = recordedTodayCount > 0 ? (presentToday / recordedTodayCount) * 100 : 0;
  const yesterdayAttendancePercentage = recordedYesterdayCount > 0 ? (presentYesterday / recordedYesterdayCount) * 100 : 0;
  
  let attendancePercentageChangeText = 'No data from yesterday';
  if (recordedYesterdayCount > 0) {
      const percentagePointDifference = todayAttendancePercentage - yesterdayAttendancePercentage;
      attendancePercentageChangeText = `${percentagePointDifference >= 0 ? '+' : ''}${percentagePointDifference.toFixed(1)}% from yesterday`;
  } else if (recordedTodayCount > 0) {
      attendancePercentageChangeText = 'First day with attendance data';
  }


  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsInSession.length}</div>
            <p className="text-xs text-muted-foreground">
              in session {selectedSession}
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
               Total staff
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fees Collected (Month)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{totalFeesCollectedSoFarThisMonth.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {feesPercentageChangeText}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Attendance
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendancePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {attendancePercentageChangeText}
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Tabs defaultValue="students" className="w-full">
            <div className="overflow-x-auto">
                <TabsList className="whitespace-nowrap">
                <TabsTrigger value="students">Manage Students</TabsTrigger>
                <TabsTrigger value="promote_students">Promote Students</TabsTrigger>
                <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
                <TabsTrigger value="results">Result Management</TabsTrigger>
                <TabsTrigger value="attendance">Student Attendance</TabsTrigger>
                <TabsTrigger value="teacher-attendance">Teacher Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fee Management</TabsTrigger>
                <TabsTrigger value="teacher-salary">Teacher Salary</TabsTrigger>
                <TabsTrigger value="notices">Events &amp; Notices</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
            </div>
          <TabsContent value="students" className="mt-4">
            <StudentList students={students} settings={settings} selectedSession={selectedSession} setSelectedSession={setSelectedSession} />
          </TabsContent>
          <TabsContent value="promote_students" className="mt-4">
            <StudentPromotion students={students} settings={settings} />
          </TabsContent>
          <TabsContent value="teachers" className="mt-4">
            <TeacherList teachers={teachers} />
          </TabsContent>
           <TabsContent value="results" className="mt-4">
            <ResultsManagement students={studentsInSession} settings={settings} />
          </TabsContent>
          <TabsContent value="attendance" className="mt-4">
            <AttendanceManagement students={studentsInSession} />
          </TabsContent>
           <TabsContent value="teacher-attendance" className="mt-4">
            <TeacherAttendanceManagement teachers={teachers} />
          </TabsContent>
           <TabsContent value="fees" className="mt-4">
            <StudentFeeManagement students={students} feeSettings={settings} selectedSession={selectedSession} />
          </TabsContent>
           <TabsContent value="teacher-salary" className="mt-4">
            <SalaryManagement teachers={teachers} />
          </TabsContent>
          <TabsContent value="notices" className="mt-4">
            <NoticeManagement notices={notices} />
          </TabsContent>
           <TabsContent value="settings" className="mt-4">
            <Settings settings={settings} onSettingsSave={(newSettings) => {
              setSettings(newSettings);
              // Also update the selected session if the active one changes
              if (newSettings.activeSession !== selectedSession) {
                setSelectedSession(newSettings.activeSession);
              }
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
