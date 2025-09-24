
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { AttendanceRecord, Teacher } from '@/lib/types';
import { getLoggedInUser } from '@/app/auth/actions';

async function checkAuthAndPermissions(permission?: 'canEditAttendance'): Promise<Teacher> {
    const user = await getLoggedInUser();
    if (!user || user.type !== 'teacher') {
        throw new Error('Unauthorized: You must be logged in as a teacher.');
    }

    const teacherDoc = await firestore.collection('teachers').doc(user.id).get();
    if (!teacherDoc.exists) {
        throw new Error('Unauthorized: Teacher not found.');
    }
    const teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;

    if (permission && !teacher[permission]) {
        throw new Error(`Permission Denied: You cannot ${permission.replace('canEdit', 'edit ')}.`);
    }

    return teacher;
}

export async function getAttendanceByDate(date: string) {
  await checkAuthAndPermissions();
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
  await checkAuthAndPermissions('canEditAttendance');

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
  await checkAuthAndPermissions();
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

export async function isHoliday(date: string): Promise<{ isHoliday: boolean; name?: string }> {
  try {
    await checkAuthAndPermissions();
    if (!firestore) {
      return { isHoliday: false };
    }
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
    await checkAuthAndPermissions();
    if (!firestore) {
      return { isClosed: false };
    }
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

export async function getHolidays(): Promise<string[]> {
  await checkAuthAndPermissions();
  try {
    const holidaysSnapshot = await firestore.collection('holidays').get();
    if (holidaysSnapshot.empty) {
      return [];
    }
    return holidaysSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
}
