
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { StudentDashboard } from '@/app/student/dashboard';
import type { Student, AttendanceRecord, ExamTypes } from '@/lib/types';
import { getStudentById, getStudentsByClass, getStudentAttendance } from './actions';
import { calculateCumulativePercentage, combineMarks } from '@/lib/result-utils';
import { firestore } from '@/lib/firebase-admin';
import { getLoggedInUser } from '../auth/actions';

export default async function StudentPage() {
  const user = await getLoggedInUser();

  if (!user || user.type !== 'student') {
    redirect('/login');
  }
  
  const studentId = user.id;

  const student = await getStudentById(studentId);
  if (!student) {
    // This could happen if the student was deleted but the cookie remains
    redirect('/logout');
  }

  let ranks: { [key in ExamTypes]?: number | null } = {};
  let attendance: AttendanceRecord[] = [];
  let settings: any = {};
  
  const examTypes: ExamTypes[] = ['quarterly', 'halfYearly', 'annual'];
  for (const examType of examTypes) {
      const classmates = await getStudentsByClass(student.class, examType);
      const studentsWithPercentage = classmates
          .map(s => {
              const { marks: combinedStudentMarks, examCyclesWithMarks } = combineMarks(s.marks, examType);
              return {
                  id: s.id,
                  percentage: calculateCumulativePercentage(combinedStudentMarks, examCyclesWithMarks, s.class),
              }
          })
          .filter(s => s.percentage !== null);
      
      studentsWithPercentage.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));

      let currentRank = 0;
      for (let i = 0; i < studentsWithPercentage.length; i++) {
          if (i === 0 || studentsWithPercentage[i].percentage! < studentsWithPercentage[i-1].percentage!) {
              currentRank = i + 1;
          }
          if (studentsWithPercentage[i].id === student.id) {
              ranks[examType] = currentRank;
              break;
          }
      }
  }
  
  attendance = await getStudentAttendance(studentId);

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
        <StudentDashboard student={student} ranks={ranks} attendance={attendance} settings={settings} />
      </main>
    </div>
  );
}
