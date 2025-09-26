
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { AttendanceRecord } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { getLoggedInUser } from '@/app/auth/actions';
import { getTeacherById } from '../actions';

async function checkAttendancePermission() {
  const user = await getLoggedInUser();
  if (!user || user.type !== 'teacher') {
    throw new Error('Unauthorized');
  }
  const teacher = await getTeacherById(user.id);
  if (!teacher?.canEditAttendance) {
    throw new Error('You do not have permission to edit attendance.');
  }
}

export async function getAttendanceByDate(date: string) {
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
  try {
    await checkAttendancePermission();
    const attendanceDocRef = firestore.collection('attendance').doc(date);
    await attendanceDocRef.set({
      [studentId]: { status }
    }, { merge: true });
    
    revalidatePath('/teacher');
    revalidatePath('/student');

    return { success: true, message: `Attendance for ${studentId} marked as ${status}.` };
  } catch (error: any) {
    console.error('Error setting attendance:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

export async function clearAttendance(studentId: string, date: string) {
    try {
        await checkAttendancePermission();
        const attendanceDocRef = firestore.collection('attendance').doc(date);
        await attendanceDocRef.update({
            [studentId]: FieldValue.delete()
        });
        
        revalidatePath('/teacher');
        revalidatePath('/student');

        return { success: true, message: `Attendance for ${studentId} cleared.` };
    } catch (error: any) {
        console.error('Error clearing attendance:', error);
        return { success: false, message: error.message || 'An unexpected error occurred while clearing attendance.' };
    }
}

export async function getStudentAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
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

    return attendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error(`Error fetching attendance for student ${studentId}:`, error);
    return [];
  }
}

export async function isHoliday(date: string): Promise<{ isHoliday: boolean; name?: string }> {
  try {
    const holidayDoc = await firestore.collection('holidays').doc(date).get();
    if (holidayDoc.exists) {
      return { isHoliday: true, name: holidayDoc.data()?.name || 'Holiday' };
    }
    return { isHoliday: false };
  } catch (error) {
    console.error('Error checking for holiday:', error);
    return { isHoliday: false };
  }
}

export async function getSchoolStatus(date: string): Promise<{ isClosed: boolean; reason?: string }> {
  try {
    const statusDoc = await firestore.collection('schoolStatus').doc(date).get();
    if (statusDoc.exists) {
      const data = statusDoc.data();
      if (data?.status === 'closed') {
        return { isClosed: true, reason: data.reason || 'School is closed today.' };
      }
    }
    return { isClosed: false };
  } catch (error) {
    console.error('Error checking for school status:', error);
    return { isClosed: false };
  }
}
