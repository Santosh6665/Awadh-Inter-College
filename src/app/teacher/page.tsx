
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { TeacherDashboard } from '@/app/teacher/dashboard';
import type { Student, Teacher } from '@/lib/types';
import { getTeacherById } from './actions';
import { getStudents } from '../admin/dashboard/students/actions';
import { getLoggedInUser } from '../auth/actions';
import { firestore } from '@/lib/firebase-admin';

export default async function TeacherPage() {
  const user = await getLoggedInUser();

  if (!user || user.type !== 'teacher') {
    redirect('/login');
  }

  const teacherId = user.id;
  const forcePasswordReset = cookies().get('force_teacher_password_reset')?.value === 'true';

  const teacher = await getTeacherById(teacherId);
  if (!teacher) {
    redirect('/logout');
  }

  // Fetch all students across all sessions
  const students = await getStudents();

  let settings: any = {};
  if (firestore) {
      const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
      if (settingsDoc.exists) {
          settings = settingsDoc.data() || {};
      }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
          <TeacherDashboard 
            teacher={teacher} 
            students={students} 
            forcePasswordReset={forcePasswordReset} 
            settings={settings} />
      </main>
    </div>
  );
}
