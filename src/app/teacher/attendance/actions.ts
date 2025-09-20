
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getAttendanceByDate(date: string) {
  const teacherId = cookies().get('teacher_id')?.value;
  if (!teacherId) {
    throw new Error('Unauthorized: You must be logged in as a teacher.');
  }
    
  try {
    const attendanceSnapshot = await firestore.collection('attendance').doc(date).get();
    if (!attendanceSnapshot.exists) {
      return {};
    }
    return attendanceSnapshot.data() || {};
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw new Error('Failed to fetch attendance data from the server.');
  }
}

export async function setAttendance(studentId: string, date: string, status: 'present' | 'absent') {
  const teacherId = cookies().get('teacher_id')?.value;
  if (!teacherId) {
    return { success: false, message: 'Unauthorized: You must be logged in as a teacher.' };
  }

  try {
    const attendanceDocRef = firestore.collection('attendance').doc(date);
    await attendanceDocRef.set({
      [studentId]: { status }
    }, { merge: true });
    
    revalidatePath('/teacher');
    revalidatePath('/student'); // Also revalidate student portal

    return { success: true, message: `Attendance for ${studentId} marked as ${status}.` };
  } catch (error) {
    console.error('Error setting attendance:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
