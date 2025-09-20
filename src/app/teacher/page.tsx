
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { TeacherLoginForm } from '@/app/teacher/login-form';
import { TeacherDashboard } from '@/app/teacher/dashboard';
import type { Student, Teacher, AttendanceRecord } from '@/lib/types';
import { getTeacherById, getTeacherAttendance } from './actions';
import { getStudents } from '../admin/dashboard/students/actions';


export default async function TeacherPage() {
  const cookieStore = cookies();
  const teacherId = cookieStore.get('teacher_id')?.value;
  const forcePasswordReset = cookieStore.get('force_teacher_password_reset')?.value === 'true';

  let teacher: Teacher | null = null;
  let students: Student[] = [];
  let attendance: AttendanceRecord[] = [];

  if (teacherId) {
    teacher = await getTeacherById(teacherId);
    if (!teacher) {
      // If cookie is invalid, redirect to clear it
      redirect('/teacher/logout');
    } else {
      // Fetch all students for the teacher to manage
      students = await getStudents();
      // Fetch teacher's own attendance
      attendance = await getTeacherAttendance(teacherId);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {teacher ? (
          <TeacherDashboard teacher={teacher} students={students} attendance={attendance} forcePasswordReset={forcePasswordReset} />
        ) : (
          <div className="flex items-center justify-center p-4 h-full bg-[rgb(231,249,244)]">
            <TeacherLoginForm />
          </div>
        )}
      </main>
    </div>
  );
}
