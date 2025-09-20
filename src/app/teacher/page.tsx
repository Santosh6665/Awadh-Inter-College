
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { TeacherLoginForm } from '@/app/teacher/login-form';
import { TeacherDashboard } from '@/app/teacher/dashboard';
import type { Teacher } from '@/lib/types';
import { getTeacherById } from './actions';

export default async function TeacherPage() {
  const cookieStore = cookies();
  const teacherId = cookieStore.get('teacher_id')?.value;

  let teacher: Teacher | null = null;

  if (teacherId) {
    teacher = await getTeacherById(teacherId);
    if (!teacher) {
      // If cookie is invalid, redirect to clear it
      redirect('/teacher/logout');
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {teacher ? (
          <TeacherDashboard teacher={teacher} />
        ) : (
          <div className="flex items-center justify-center p-4 h-full bg-[rgb(231,249,254)]">
            <TeacherLoginForm />
          </div>
        )}
      </main>
    </div>
  );
}
