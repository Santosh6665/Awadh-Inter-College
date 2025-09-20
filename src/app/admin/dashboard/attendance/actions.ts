
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { AttendanceRecord, Student } from '@/lib/types';

const AttendanceSchema = z.object({
  studentId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  status: z.enum(['Present', 'Absent', 'Late']),
});

export async function markAttendance(
  student: Pick<Student, 'id' | 'name' | 'class' | 'section'>,
  date: string,
  status: 'Present' | 'Absent' | 'Late'
) {
  const validatedFields = AttendanceSchema.safeParse({
    studentId: student.id,
    date,
    status,
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  try {
    const { studentId, date, status } = validatedFields.data;
    const attendanceDocId = `${date}_${studentId}`;
    const attendanceDocRef = firestore.collection('attendance').doc(attendanceDocId);

    await attendanceDocRef.set({
      studentId,
      studentName: student.name,
      class: student.class,
      section: student.section,
      date,
      status,
      updatedAt: new Date(),
    }, { merge: true });

    revalidatePath('/admin/dashboard'); 
    return { success: true, message: `Attendance marked for ${student.name}.` };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  if (!date) return [];
  try {
    const attendanceSnapshot = await firestore.collection('attendance').where('date', '==', date).get();
    if (attendanceSnapshot.empty) {
      return [];
    }
    return attendanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error(`Error fetching attendance for date ${date}:`, error);
    return [];
  }
}
