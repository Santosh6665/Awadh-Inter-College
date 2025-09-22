
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const MarksSchema = z.object({
  physics: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  chemistry: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  maths: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  english: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  computerScience: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
});

const ExamTypeSchema = z.enum(['quarterly', 'halfYearly', 'annual']);

export type MarksFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function updateStudentMarks(
  id: string,
  examType: z.infer<typeof ExamTypeSchema>,
  prevState: MarksFormState,
  formData: FormData
): Promise<MarksFormState> {
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
    const marksData = validatedFields.data;
    
    // Convert empty strings to null for Firestore
    const marksForUpdate = Object.fromEntries(
        Object.entries(marksData).map(([key, value]) => [key, value === '' ? null : value])
    );
    
    const studentDoc = firestore.collection('students').doc(id);
    await studentDoc.set({
        marks: {
            [validatedExamType.data]: marksForUpdate
        },
        updatedAt: new Date()
    }, { merge: true });

    revalidatePath('/admin/dashboard');
    revalidatePath('/student');
    return { success: true, message: 'Student marks updated successfully.' };
  } catch (error) {
    console.error('Error updating student marks:', error);
    return { success: false, message: 'An unexpected error occurred while updating marks.' };
  }
}
