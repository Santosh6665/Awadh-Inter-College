
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const StudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  rollNumber: z.string().min(1, 'Roll number is required.'),
  class: z.string().min(1, 'Class is required.'),
  section: z.string().min(1, 'Section is required.'),
  dob: z.string().min(1, 'Date of birth is required.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  fatherName: z.string().min(2, "Father's name is required."),
  address: z.string().min(5, 'Address is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const UpdateStudentSchema = StudentSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
});


export type StudentFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function addStudent(
  prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const validatedFields = StudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const studentsCollection = firestore.collection('students');
    const studentDoc = studentsCollection.doc(validatedFields.data.rollNumber);

    const docSnapshot = await studentDoc.get();
    if (docSnapshot.exists) {
        return { success: false, message: 'A student with this Roll Number already exists.' };
    }

    await studentDoc.set({
      ...validatedFields.data,
      createdAt: new Date(),
    });
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Student added successfully.' };
  } catch (error) {
    console.error('Error adding student:', error);
    return { success: false, message: 'An unexpected error occurred while adding the student.' };
  }
}

export async function updateStudent(
  id: string,
  prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  if (!id) {
    return { success: false, message: 'Student ID is missing.' };
  }

  const validatedFields = UpdateStudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { password, ...studentData } = validatedFields.data;
    const updateData: { [key: string]: any } = { ...studentData, updatedAt: new Date() };

    if (password) {
      updateData.password = password;
    }

    const studentDoc = firestore.collection('students').doc(id);
    await studentDoc.update(updateData);

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Student updated successfully.' };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, message: 'An unexpected error occurred while updating the student.' };
  }
}

export async function deleteStudent(id: string) {
  if (!id) {
    return { success: false, message: 'Student ID is missing.' };
  }
  try {
    await firestore.collection('students').doc(id).delete();
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Student deleted successfully.' };
  } catch (error) {
    console.error('Error deleting student:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getStudents() {
  try {
    const studentsSnapshot = await firestore.collection('students').orderBy('name').get();
    if (studentsSnapshot.empty) {
      return [];
    }
    return studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to strings to make them serializable
      const serializedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value && typeof value.toDate === 'function') {
            return [key, value.toDate().toISOString()];
          }
          return [key, value];
        })
      );
      // Ensure password is not sent to the client
      delete serializedData.password;

      return {
        id: doc.id,
        ...serializedData,
      };
    }) as any[]; // Using any to avoid TS errors with Firestore data types
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}
