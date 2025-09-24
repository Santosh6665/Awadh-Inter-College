
import { redirect } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { getLoggedInUser } from "../auth/actions";
import AdminDashboardPage from './dashboard/page';
import { getStudents } from './dashboard/students/actions';
import { getTeachers } from './dashboard/teachers/actions';
import { getNotices } from './dashboard/notices/actions';
import { firestore } from '@/lib/firebase-admin';
import { format } from 'date-fns';


export default async function AdminPage() {
  const user = await getLoggedInUser();
  if (!user || user.type !== 'admin') {
    redirect('/login');
  }

  let students = [];
  let teachers = [];
  let settings = {};
  let notices = [];
  let todayAttendanceData = {};
  let yesterdayAttendanceData = {};

  if (firestore) {
    try {
      const today = new Date();
      students = await getStudents();
      teachers = await getTeachers();
      notices = await getNotices();
      
      const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
      if (settingsDoc.exists) {
        settings = settingsDoc.data() || {};
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayDateString = format(today, 'yyyy-MM-dd');
      const yesterdayDateString = format(yesterday, 'yyyy-MM-dd');

      const todayAttendanceDoc = await firestore.collection('attendance').doc(todayDateString).get();
      if (todayAttendanceDoc.exists) {
        todayAttendanceData = todayAttendanceDoc.data() || {};
      }

      const yesterdayAttendanceDoc = await firestore.collection('attendance').doc(yesterdayDateString).get();
      if (yesterdayAttendanceDoc.exists) {
        yesterdayAttendanceData = yesterdayAttendanceDoc.data() || {};
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  } else {
     console.warn("Firestore is not available. Skipping data fetch for Admin Dashboard.");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
        <AdminDashboardPage 
            students={students}
            teachers={teachers}
            settings={settings}
            notices={notices}
            todayAttendanceData={todayAttendanceData}
            yesterdayAttendanceData={yesterdayAttendanceData}
        />
      </main>
    </div>
  );
}
