
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';
import type { Teacher } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { getLoggedInUser } from '../auth/actions';

const setPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function getTeacherById(id: string): Promise<Teacher | null> {
  try {
    if (!firestore) return null;
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
    const user = await getLoggedInUser();
    if (!user || user.id !== teacherId || user.type !== 'teacher') {
        return { success: false, message: 'Unauthorized.' };
    }

    const password = formData.get('password');
    const validatedFields = setPasswordSchema.safeParse({ password });

    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors.password?.[0] || 'Invalid password.' };
    }
    
    try {
        if (!firestore) throw new Error('Firestore not initialized');
        const teacherDocRef = firestore.collection('teachers').doc(teacherId);
        await teacherDocRef.update({ password: validatedFields.data.password });

        revalidatePath('/teacher');
        return { success: true, message: 'Password updated successfully.' };

    } catch (error) {
        console.error('Password update error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}


const MarksSchema = z.object({
  oral: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  englishOral: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  english: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  hindiOral: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  hindi: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  mathematicsOral: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  mathematics: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  science: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  computer: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  socialScience: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  art: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  homeScience: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  physics: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  chemistry: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  biology: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
});

const ExamTypeSchema = z.enum(['quarterly', 'halfYearly', 'annual']);

export type MarksFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function updateStudentMarksByTeacher(
  id: string,
  examType: z.infer<typeof ExamTypeSchema>,
  prevState: MarksFormState,
  formData: FormData
): Promise<MarksFormState> {
  const user = await getLoggedInUser();
  if (!user || user.type !== 'teacher') {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }
  
  const teacher = await getTeacherById(user.id);
  if (!teacher?.canEditResults) {
    return { success: false, message: 'You do not have permission to edit results.' };
  }

  if (!id) {
    return { success: false, message: 'Student ID is missing.' };
  }
  
  const validatedExamType = ExamTypeSchema.safeParse(examType);
  if(!validatedExamType.success) {
    return { success: false, message: 'Invalid exam type.' };
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
    if (!firestore) throw new Error('Firestore not initialized');
    const marksData = validatedFields.data;
    
    const marksForUpdate = Object.fromEntries(
        Object.entries(marksData).map(([key, value]) => [key, value === '' ? FieldValue.delete() : value])
    );
    
    const studentDoc = firestore.collection('students').doc(id);
    await studentDoc.set({
        marks: {
          [validatedExamType.data]: marksForUpdate
        },
        updatedAt: new Date()
    }, { merge: true });

    revalidatePath('/teacher');
    revalidatePath('/student'); // Also revalidate student portal
    return { success: true, message: 'Student marks updated successfully.' };
  } catch (error) {
    console.error('Error updating student marks:', error);
    return { success: false, message: 'An unexpected error occurred while updating marks.' };
  }
}
