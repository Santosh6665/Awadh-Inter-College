
'use server';

import { firestore } from '@/lib/firebase-admin';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { FieldPath } from 'firebase-admin/firestore';
import { getLoggedInUser } from '@/app/auth/actions';

async function checkTeacherAuth() {
    const user = await getLoggedInUser();
    if (!user || user.type !== 'teacher') {
        throw new Error('Unauthorized');
    }
}

export async function getHolidaysInMonth(date: Date): Promise<string[]> {
    try {
        await checkTeacherAuth();
        if (!firestore) {
            console.error("Firestore is not initialized. Check environment variables.");
            return [];
        }
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed (0 for January)

        const holidaysSnapshot = await firestore.collection('holidays').get();
        if (holidaysSnapshot.empty) {
            return [];
        }

        const holidaysForMonth = holidaysSnapshot.docs.filter(doc => {
            const docDate = new Date(doc.id + 'T00:00:00'); // Assume UTC date
            return docDate.getUTCFullYear() === year && docDate.getUTCMonth() === month;
        }).map(doc => doc.id);
        
        return holidaysForMonth;
    } catch (error) {
        console.error('Error fetching holidays for teacher:', error);
        return []; // Return a safe default value
    }
}

export async function getTeacherAttendanceForMonth(date: Date) {
    try {
        await checkTeacherAuth();
        if (!firestore) {
            console.error("Firestore is not initialized. Check environment variables.");
            return {};
        }
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        
        const attendanceSnapshot = await firestore.collection('teacherAttendance')
            .where(FieldPath.documentId(), '>=', format(start, 'yyyy-MM-dd'))
            .where(FieldPath.documentId(), '<=', format(end, 'yyyy-MM-dd'))
            .get();

        const attendanceByTeacher: { [teacherId: string]: { [date: string]: 'present' | 'absent' } } = {};
        
        attendanceSnapshot.forEach(doc => {
            const dateStr = doc.id;
            const dailyRecords = doc.data();
            for (const teacherId in dailyRecords) {
                if (!attendanceByTeacher[teacherId]) {
                    attendanceByTeacher[teacherId] = {};
                }
                attendanceByTeacher[teacherId][dateStr] = dailyRecords[teacherId].status;
            }
        });

        return attendanceByTeacher;
    } catch (error) {
        console.error('Error fetching teacher attendance for month:', error);
        return {}; // Return a safe default value
    }
}
