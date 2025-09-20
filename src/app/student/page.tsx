
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StudentLoginForm } from '@/app/student/login-form';
import { StudentDashboard } from '@/app/student/dashboard';
import type { Student } from '@/lib/types';
import { getStudentById } from './actions';


export default async function StudentPage() {
  const cookieStore = cookies();
  const studentId = cookieStore.get('student_id')?.value;
  const forcePasswordReset = cookieStore.get('force_password_reset')?.value === 'true';

  let student: Student | null = null;
  if (studentId) {
    student = await getStudentById(studentId);
    if (!student) {
      // If cookie is invalid, redirect to clear it
      redirect('/student/logout');
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/40">
        {student ? (
          <StudentDashboard student={student} forcePasswordReset={forcePasswordReset} />
        ) : (
          <div className="flex items-center justify-center p-4 h-full">
            <StudentLoginForm />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
