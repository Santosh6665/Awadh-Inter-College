
'use server';

import { firestore } from '@/lib/firebase-admin';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { getLoggedInUser } from '@/app/auth/actions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
    const user = await getLoggedInUser();
    // Allow both admin and teacher to access salary-related data
    if (!user || (user.type !== 'admin' && user.type !== 'teacher')) {
        throw new Error('Unauthorized');
    }
}

const PaymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
    method: z.enum(['Cash', 'Bank Transfer', 'Cheque']),
    date: z.string().min(1, 'Date is required.'),
    month: z.string().min(1, 'Month is required.'),
});

export type FormState = {
  success: boolean;
  message: string;
};


export async function getHolidaysInMonth(date: Date) {
    await checkAuth();
    try {
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
        return [];
    }
}

export async function getTeacherAttendanceForMonth(date: Date) {
    try {
        await checkAuth();
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
        // Return an empty object on failure to prevent client-side crashes
        return {};
    }
}

export async function recordSalaryPayment(
  teacherId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getLoggedInUser();
  if (!user || user.type !== 'admin') {
    return { success: false, message: 'Unauthorized: Only admins can record payments.' };
  }

  if (!teacherId) {
    return { success: false, message: 'Teacher ID is missing.' };
  }
  
  const validatedFields = PaymentSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the payment details.',
    };
  }

  try {
    const paymentData = validatedFields.data;
    const newPayment = {
        id: new Date().getTime().toString(), // simple unique id
        ...paymentData,
    };
    
    const teacherDoc = firestore.collection('teachers').doc(teacherId);
    await teacherDoc.update({
        salaryPayments: FieldValue.arrayUnion(newPayment),
        updatedAt: new Date()
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Salary payment recorded successfully.' };
  } catch (error) {
    console.error('Error recording salary payment:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
