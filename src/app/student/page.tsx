
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { StudentDashboard } from '@/app/student/dashboard';
import type { Student, AttendanceRecord, ExamTypes } from '@/lib/types';
import { getStudentById, getStudentsByClass, getStudentAttendance, getStudentDataForSession } from './actions';
import { calculateCumulativePercentage, combineMarks } from '@/lib/result-utils';
import { firestore } from '@/lib/firebase-admin';
import { getLoggedInUser } from '../auth/actions';

export default async function StudentPage() {
  const user = await getLoggedInUser();

  if (!user || user.type !== 'student') {
    redirect('/login');
  }
  
  const studentId = user.id;

  const data = await getStudentDataForSession(studentId);

  if (!data?.student) {
    // This could happen if the student was deleted but the cookie remains
    redirect('/logout');
  }

  const { student, ranks, attendance } = data;

  let settings: any = {};
  let allSessions: string[] = [];
  
  if (firestore) {
      const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
      if (settingsDoc.exists) {
          settings = settingsDoc.data() || {};
          allSessions = settings.sessions || [];
      }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
        <StudentDashboard 
            student={student} 
            ranks={ranks} 
            attendance={attendance} 
            settings={settings}
            allSessions={allSessions}
        />
      </main>
    </div>
  );
}
