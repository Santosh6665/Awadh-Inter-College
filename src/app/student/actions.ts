
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';

const loginSchema = z.object({
  rollNumber: z.string(),
  password: z.string().min(6),
});

export async function loginStudent(credentials: z.infer<typeof loginSchema>) {
  try {
    const validatedCredentials = loginSchema.safeParse(credentials);
    if (!validatedCredentials.success) {
      return { success: false, message: 'Invalid credentials format.' };
    }

    const { rollNumber, password } = validatedCredentials.data;

    const studentsCollection = firestore.collection('students');
    const studentDoc = await studentsCollection.doc(rollNumber).get();

    if (!studentDoc.exists) {
      return { success: false, message: 'Student not found.' };
    }

    const studentData = studentDoc.data();
    if (studentData?.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    cookies().set('student_id', rollNumber, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    revalidatePath('/student');
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function logoutStudent() {
  cookies().delete('student_id');
  revalidatePath('/student');
}

export async function getStudentById(id: string) {
  try {
    const studentDoc = await firestore.collection('students').doc(id).get();
    if (!studentDoc.exists) {
      return null;
    }
    const data = studentDoc.data();
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

    return { id: studentDoc.id, ...serializedData } as any;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}
