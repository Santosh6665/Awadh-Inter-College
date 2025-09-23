
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Teacher } from '@/lib/types';

const TeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  subject: z.string().min(2, 'Subject is required.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  dob: z.string().optional(),
  qualification: z.string().optional(),
  canEditAttendance: z.preprocess((val) => val === 'on', z.boolean()).optional(),
  canEditResults: z.preprocess((val) => val === 'on', z.boolean()).optional(),
  employeeId: z.string().optional(),
  dateOfJoining: z.string().optional(),
  panOrAadharNumber: z.string().optional(),
});

export type TeacherFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function addTeacher(
  prevState: TeacherFormState,
  formData: FormData
): Promise<TeacherFormState> {
  const validatedFields = TeacherSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const teachersCollection = firestore.collection('teachers');
    const teacherData = validatedFields.data;
    
    // Check if a teacher with this email already exists
    const existingTeacherQuery = await teachersCollection.where('email', '==', teacherData.email).get();
    if (!existingTeacherQuery.empty) {
        return { success: false, message: 'A teacher with this email already exists.' };
    }

    await teachersCollection.add({
      ...teacherData,
      isTeacher: true, // Ensure all new teachers can log in
      createdAt: new Date(),
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Teacher added successfully.' };
  } catch (error) {
    console.error('Error adding teacher:', error);
    return { success: false, message: 'An unexpected error occurred while adding the teacher.' };
  }
}

export async function updateTeacher(
  id: string,
  prevState: TeacherFormState,
  formData: FormData
): Promise<TeacherFormState> {
  if (!id) {
    return { success: false, message: 'Teacher ID is missing.' };
  }

  const validatedFields = TeacherSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const teacherData = validatedFields.data;
    const updateData: { [key: string]: any } = { ...teacherData, updatedAt: new Date() };

    const teacherDoc = firestore.collection('teachers').doc(id);
    await teacherDoc.update(updateData);

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Teacher updated successfully.' };
  } catch (error) {
    console.error('Error updating teacher:', error);
    return { success: false, message: 'An unexpected error occurred while updating the teacher.' };
  }
}

export async function deleteTeacher(id: string) {
  if (!id) {
    return { success: false, message: 'Teacher ID is missing.' };
  }
  try {
    await firestore.collection('teachers').doc(id).delete();
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Teacher deleted successfully.' };
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getTeachers(): Promise<Teacher[]> {
  try {
    const teachersSnapshot = await firestore.collection('teachers').orderBy('name').get();
    if (teachersSnapshot.empty) {
      return [];
    }
    return teachersSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to strings to make them serializable for client components
      const serializedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value && typeof value.toDate === 'function') {
            return [key, value.toDate().toISOString()];
          }
          return [key, value];
        })
      );

      return {
        id: doc.id,
        ...serializedData,
      } as Teacher;
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
}

export async function toggleAttendancePermission(id: string, canEditAttendance: boolean) {
  if (!id) {
    return { success: false, message: 'Teacher ID is missing.' };
  }
  try {
    await firestore.collection('teachers').doc(id).update({ canEditAttendance });
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Permission updated successfully.' };
  } catch (error) {
    console.error('Error updating permission:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function toggleResultsPermission(id: string, canEditResults: boolean) {
  if (!id) {
    return { success: false, message: 'Teacher ID is missing.' };
  }
  try {
    await firestore.collection('teachers').doc(id).update({ canEditResults });
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Permission updated successfully.' };
  } catch (error) {
    console.error('Error updating permission:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
