
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function getAttendanceByDate(date: string) {
  try {
    const attendanceSnapshot = await firestore.collection('attendance').doc(date).get();
    if (!attendanceSnapshot.exists) {
      return {};
    }
    return attendanceSnapshot.data() || {};
  } catch (error) {
    console.error('Error fetching attendance:', error);
    // Re-throw the error to be caught by the client-side component
    throw new Error('Failed to fetch attendance data from the server.');
  }
}

export async function setAttendance(studentId: string, date: string, status: 'present' | 'absent' | 'late') {
  try {
    const attendanceDocRef = firestore.collection('attendance').doc(date);
    await attendanceDocRef.set({
      [studentId]: { status }
    }, { merge: true });
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/student');

    return { success: true, message: `Attendance for ${studentId} marked as ${status}.` };
  } catch (error) {
    console.error('Error setting attendance:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
