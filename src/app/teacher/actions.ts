
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';
import type { Teacher, AttendanceRecord } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const setPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function loginTeacher(credentials: z.infer<typeof loginSchema>) {
  try {
    const validatedCredentials = loginSchema.safeParse(credentials);
    if (!validatedCredentials.success) {
      return { success: false, message: 'Invalid credentials format.' };
    }

    const { email, password } = validatedCredentials.data;

    const teachersCollection = firestore.collection('teachers');
    const teacherQuery = await teachersCollection.where('email', '==', email).limit(1).get();

    if (teacherQuery.empty) {
      return { success: false, message: 'Teacher not found.' };
    }
    
    const teacherDoc = teacherQuery.docs[0];
    const teacherData = teacherDoc.data();
    
    // Security Check: Ensure the user is marked as a teacher.
    if (teacherData.isTeacher !== true) {
        return { success: false, message: 'You do not have permission to log in.' };
    }
    
    let needsPasswordReset = false;
    
    if (teacherData.password) {
        if (teacherData.password !== password) {
            return { success: false, message: 'Incorrect password.' };
        }
    } else {
        const firstNameRaw = teacherData.name.split(' ')[0];
        const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1);
        const phoneFragment = teacherData.phone.substring(0, 5);
        const defaultPassword = `${firstName}@${phoneFragment}`;

        if (password !== defaultPassword) {
            return { success: false, message: 'Incorrect password.' };
        }
        needsPasswordReset = true;
    }

    cookies().set('teacher_id', teacherDoc.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    if (needsPasswordReset) {
        cookies().set('force_teacher_password_reset', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15, // 15 minutes to reset password
            path: '/',
        });
    } else {
        cookies().delete('force_teacher_password_reset');
    }

    revalidatePath('/teacher');
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function logoutTeacher() {
  cookies().delete('teacher_id');
  cookies().delete('force_teacher_password_reset');
  revalidatePath('/teacher');
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  try {
    const teacherDoc = await firestore.collection('teachers').doc(id).get();
    if (!teacherDoc.exists) {
      return null;
    }
    const data = teacherDoc.data();
    if (!data) return null;

    const serializedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value && typeof value.toDate === 'function') {
          return [key, value.toDate().toISOString()];
        }
        return [key, value];
      })
    );
    
    delete serializedData.password;

    return { id: teacherDoc.id, ...serializedData } as Teacher;
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return null;
  }
}

export async function setTeacherPassword(teacherId: string, formData: FormData) {
    const password = formData.get('password');
    const validatedFields = setPasswordSchema.safeParse({ password });

    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors.password?.[0] || 'Invalid password.' };
    }
    
    try {
        const teacherDocRef = firestore.collection('teachers').doc(teacherId);
        await teacherDocRef.update({ password: validatedFields.data.password });

        cookies().delete('force_teacher_password_reset');
        revalidatePath('/teacher');
        return { success: true, message: 'Password updated successfully.' };

    } catch (error) {
        console.error('Password update error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}


const MarksSchema = z.object({
  physics: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  chemistry: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  maths: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  english: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  computerScience: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  remarks: z.string().optional(),
});


export type MarksFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function updateStudentMarksByTeacher(
  id: string,
  prevState: MarksFormState,
  formData: FormData
): Promise<MarksFormState> {
  // Basic auth check: ensure a teacher is logged in
  const teacherId = cookies().get('teacher_id')?.value;
  if (!teacherId) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  if (!id) {
    return { success: false, message: 'Student ID is missing.' };
  }

  const validatedFields = MarksSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Marks should be between 0 and 100.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const marksData = validatedFields.data;
    
    const marksForUpdate = Object.fromEntries(
        Object.entries(marksData).map(([key, value]) => [key, value === '' ? null : value])
    );
    
    const studentDoc = firestore.collection('students').doc(id);
    await studentDoc.update({
        marks: marksForUpdate,
        updatedAt: new Date()
    });

    revalidatePath('/teacher');
    revalidatePath('/student'); // Also revalidate student portal
    return { success: true, message: 'Student marks updated successfully.' };
  } catch (error) {
    console.error('Error updating student marks:', error);
    return { success: false, message: 'An unexpected error occurred while updating marks.' };
  }
}

export async function getTeacherAttendance(teacherId: string): Promise<AttendanceRecord[]> {
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
