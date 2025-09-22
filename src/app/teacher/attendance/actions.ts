
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AttendanceRecord } from '@/lib/types';

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

export async function getStudentAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
  const teacherId = cookies().get('teacher_id')?.value;
  if (!teacherId) {
    throw new Error('Unauthorized: You must be logged in as a teacher.');
  }

  try {
    const attendanceSnapshot = await firestore.collection('attendance').get();
    const attendanceRecords: AttendanceRecord[] = [];
    
    attendanceSnapshot.forEach(doc => {
      const date = doc.id;
      const data = doc.data();
      if (data && data[studentId]) {
        attendanceRecords.push({
          date,
          status: data[studentId].status,
        });
      }
    });

    // Sort by date descending
    return attendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error(`Error fetching attendance for student ${studentId}:`, error);
    return [];
  }
}
