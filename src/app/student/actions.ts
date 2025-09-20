
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';

const loginSchema = z.object({
  rollNumber: z.string(),
  password: z.string().min(1), // Allow any password length for default check
});

const setPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
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
    if (!studentData) {
        return { success: false, message: 'Student data could not be read.' };
    }

    let isFirstLogin = false;

    // If password field exists, use it
    if (studentData.password) {
        if (studentData.password !== password) {
            return { success: false, message: 'Incorrect password.' };
        }
    } else {
        // Otherwise, construct and check default password
        const firstNameRaw = studentData.name.split(' ')[0];
        const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1);
        const yearOfBirth = new Date(studentData.dob).getFullYear();
        const defaultPassword = `${firstName}@${yearOfBirth}`;

        if (password !== defaultPassword) {
            return { success: false, message: 'Incorrect password or password not set.' };
        }
        isFirstLogin = true;
    }


    cookies().set('student_id', rollNumber, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    if (isFirstLogin) {
        cookies().set('force_password_reset', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15, // 15 minutes to reset password
            path: '/',
        });
    }


    revalidatePath('/student');
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function logoutStudent() {
  cookies().delete('student_id');
  cookies().delete('force_password_reset');
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
    // Even if password exists, we don't send it to the client
    delete serializedData.password;

    return { id: studentDoc.id, ...serializedData } as any;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

export async function setStudentPassword(studentId: string, formData: FormData) {
    const password = formData.get('password');
    const validatedFields = setPasswordSchema.safeParse({ password });

    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors.password?.[0] || 'Invalid password.' };
    }
    
    try {
        const studentDocRef = firestore.collection('students').doc(studentId);
        await studentDocRef.update({ password: validatedFields.data.password });

        cookies().delete('force_password_reset');
        revalidatePath('/student');
        return { success: true, message: 'Password updated successfully.' };

    } catch (error) {
        console.error('Password update error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
