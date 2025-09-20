
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';
import type { Teacher } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

    // In a real app, you would have a secure password hash.
    // For this portal, we will use a default password logic.
    // Default password: First name (capitalized) + @ + first 5 digits of phone number
    const firstNameRaw = teacherData.name.split(' ')[0];
    const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1);
    const phoneFragment = teacherData.phone.substring(0, 5);
    const defaultPassword = `${firstName}@${phoneFragment}`;

    if (password !== defaultPassword) {
        return { success: false, message: 'Incorrect password.' };
    }

    cookies().set('teacher_id', teacherDoc.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    revalidatePath('/teacher');
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function logoutTeacher() {
  cookies().delete('teacher_id');
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

    return { id: teacherDoc.id, ...serializedData } as Teacher;
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return null;
  }
}
