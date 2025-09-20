
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StudentLoginForm } from '@/app/student/login-form';
import { StudentDashboard } from '@/app/student/dashboard';
import type { Student, AttendanceRecord } from '@/lib/types';
import { getStudentById, getStudentsByClass, getStudentAttendance } from './actions';
import { calculatePercentage } from '@/lib/result-utils';


export default async function StudentPage() {
  const cookieStore = cookies();
  const studentId = cookieStore.get('student_id')?.value;
  const forcePasswordReset = cookieStore.get('force_password_reset')?.value === 'true';

  let student: Student | null = null;
  let rank: number | null = null;
  let attendance: AttendanceRecord[] = [];

  if (studentId) {
    student = await getStudentById(studentId);
    if (!student) {
      // If cookie is invalid, redirect to clear it
      redirect('/student/logout');
    } else {
       // Fetch attendance
       attendance = await getStudentAttendance(student.id);

       // Calculate rank if student exists
        const classmates = await getStudentsByClass(student.class);
        const studentsWithPercentage = classmates
            .map(s => ({
                id: s.id,
                percentage: calculatePercentage(s.marks),
            }))
            .filter(s => s.percentage !== null);
        
        studentsWithPercentage.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));

        let currentRank = 0;
        for (let i = 0; i < studentsWithPercentage.length; i++) {
            if (i === 0 || studentsWithPercentage[i].percentage < studentsWithPercentage[i-1].percentage) {
                currentRank = i + 1;
            }
            if (studentsWithPercentage[i].id === student.id) {
                rank = currentRank;
                break;
            }
        }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/40">
        {student ? (
          <StudentDashboard student={student} rank={rank} attendance={attendance} forcePasswordReset={forcePasswordReset} />
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
