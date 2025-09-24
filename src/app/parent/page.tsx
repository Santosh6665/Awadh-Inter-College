
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import type { Student, AttendanceRecord, ExamTypes } from '@/lib/types';
import { getLoggedInUser } from '../auth/actions';
import { getChildrenForParent } from './actions';
import { getStudentDataForSession } from '@/app/student/actions';
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
  let allSessions: string[] = [];
  if (firestore) {
    const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
    if (settingsDoc.exists) {
        settings = settingsDoc.data() || {};
        allSessions = settings.sessions || [];
    }
  }
  
  // Only fetch details for the active session by default
  const activeSessionChildren = children.filter(c => c.session === settings.activeSession);

  // Fetch detailed data for each child
  const childrenWithDetails = await Promise.all(activeSessionChildren.map(async (child) => {
    const data = await getStudentDataForSession(child.id);
    return {
        student: { ...child, ...data?.student },
        ranks: data?.ranks || {},
        attendance: data?.attendance || [],
    };
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
          <ParentDashboard parent={user} childrenWithDetails={childrenWithDetails} settings={settings} allSessions={allSessions} />
      </main>
    </div>
  );
}
