'use server';

import { firestore } from '@/lib/firebase-admin';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function getHolidaysInMonth(date: Date) {
    try {
        const holidaysSnapshot = await firestore.collection('holidays').get();
        const holidaysInMonth: string[] = [];
        const month = date.getMonth();
        const year = date.getFullYear();

        holidaysSnapshot.forEach(doc => {
            const holidayDate = new Date(doc.id);
            if (holidayDate.getMonth() === month && holidayDate.getFullYear() === year) {
                holidaysInMonth.push(doc.id);
            }
        });
        return holidaysInMonth;
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

export async function getTeacherAttendanceForMonth(date: Date) {
    try {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        
        const attendanceSnapshot = await firestore.collection('teacherAttendance')
            .where(firestore.FieldPath.documentId(), '>=', format(start, 'yyyy-MM-dd'))
            .where(firestore.FieldPath.documentId(), '<=', format(end, 'yyyy-MM-dd'))
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
        return {};
    }
}
