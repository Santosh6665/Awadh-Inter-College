
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function getTeacherAttendanceByDate(date: string) {
  try {
    const attendanceSnapshot = await firestore.collection('teacherAttendance').doc(date).get();
    if (!attendanceSnapshot.exists) {
      return {};
    }
    return attendanceSnapshot.data() || {};
  } catch (error) {
    console.error('Error fetching teacher attendance:', error);
    // Re-throw the error to be caught by the client-side component
    throw new Error('Failed to fetch teacher attendance data from the server.');
  }
}

export async function setTeacherAttendance(teacherId: string, date: string, status: 'present' | 'absent') {
  try {
    const attendanceDocRef = firestore.collection('teacherAttendance').doc(date);
    await attendanceDocRef.set({
      [teacherId]: { status }
    }, { merge: true });
    
    revalidatePath('/admin/dashboard');

    return { success: true, message: `Attendance for ${teacherId} marked as ${status}.` };
  } catch (error) {
    console.error('Error setting teacher attendance:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
