
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { AttendanceRecord } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

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

export async function clearTeacherAttendance(teacherId: string, date: string) {
    try {
        const attendanceDocRef = firestore.collection('teacherAttendance').doc(date);
        await attendanceDocRef.update({
            [teacherId]: FieldValue.delete()
        });
        
        revalidatePath('/admin/dashboard');

        return { success: true, message: `Attendance for ${teacherId} cleared.` };
    } catch (error) {
        console.error('Error clearing teacher attendance:', error);
        return { success: false, message: 'An unexpected error occurred while clearing attendance.' };
    }
}

export async function getTeacherAttendanceHistory(teacherId: string): Promise<AttendanceRecord[]> {
  try {
    const attendanceSnapshot = await firestore.collection('teacherAttendance').get();
    const attendanceRecords: AttendanceRecord[] = [];
    
    attendanceSnapshot.forEach(doc => {
      const date = doc.id;
      const data = doc.data();
      if (data && data[teacherId]) {
        attendanceRecords.push({
          date,
          status: data[teacherId].status,
        });
      }
    });

    // Sort by date descending
    return attendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error(`Error fetching attendance for teacher ${teacherId}:`, error);
    return [];
  }
}

export async function isHoliday(date: string): Promise<{ isHoliday: boolean; name?: string }> {
  try {
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
