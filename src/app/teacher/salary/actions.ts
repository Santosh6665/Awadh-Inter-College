
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
    return user.id; // Return the user ID for authenticated calls
}

export async function getTeacherSalaryDataForMonth(date: Date) {
    const teacherId = await checkTeacherAuth();
    
    // Using Promise.all to fetch data concurrently for better performance.
    const [attendance, holidays] = await Promise.all([
        getTeacherAttendanceForMonth(date, teacherId),
        getHolidaysInMonth(date)
    ]);
    
    return { attendance, holidays };
}


async function getHolidaysInMonth(date: Date) {
    try {
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
        console.error('Error fetching holidays:', error);
        return []; // Return empty array on error to prevent crashes
    }
}

async function getTeacherAttendanceForMonth(date: Date, teacherId: string) {
    try {
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

        const attendanceForTeacher: { [teacherId: string]: { [date: string]: 'present' | 'absent' } } = {};
        
        attendanceSnapshot.forEach(doc => {
            const dateStr = doc.id;
            const dailyRecords = doc.data();
            // We only need the data for the currently logged-in teacher
            if (dailyRecords && dailyRecords[teacherId]) {
                 if (!attendanceForTeacher[teacherId]) {
                    attendanceForTeacher[teacherId] = {};
                }
                attendanceForTeacher[teacherId][dateStr] = dailyRecords[teacherId].status;
            }
        });

        return attendanceForTeacher;
    } catch (error) {
        console.error('Error fetching teacher attendance for month:', error);
        return {}; // Return empty object on error to prevent crashes
    }
}
