import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import type { Student, AttendanceRecord, ExamTypes } from '@/lib/types';
import { getLoggedInUser } from '../auth/actions';
import { getChildrenForParent } from './actions';
import { getStudentAttendance, getStudentsByClass, checkSiblingStatus } from '@/app/student/actions';
import { calculateCumulativePercentage, combineMarks } from '@/lib/result-utils';
import { firestore } from '@/lib/firebase-admin';
import { ParentDashboard } from './dashboard';

export default async function ParentPage() {
  const user = await getLoggedInUser();

  if (!user || user.type !== 'parent') {
    redirect('/login');
  }
  
  const parentPhone = user.id;
  const children = await getChildrenForParent(parentPhone);
  
  if (children.length === 0) {
    // This could happen if children are unassigned from this parent
    redirect('/logout');
  }

  let settings: any = {};
  if (firestore) {
    const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
    if (settingsDoc.exists) {
        settings = settingsDoc.data() || {};
    }
  }
  
  // Fetch detailed data for each child
  const childrenWithDetails = await Promise.all(children.map(async (child) => {
    let ranks: { [key in ExamTypes]?: number | null } = {};
    const examTypes: ExamTypes[] = ['quarterly', 'halfYearly', 'annual'];
    
    for (const examType of examTypes) {
      const classmates = await getStudentsByClass(child.class, examType);
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
          if (studentsWithPercentage[i].id === child.id) {
              ranks[examType] = currentRank;
              break;
          }
      }
    }
    
    const attendance = await getStudentAttendance(child.id);
    const isSibling = await checkSiblingStatus(child);

    return { ...child, ranks, attendance, isSibling };
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
          <ParentDashboard parent={user} childrenWithDetails={childrenWithDetails} settings={settings} />
      </main>
    </div>
  );
}
