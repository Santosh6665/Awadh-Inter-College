
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';
import type { Student, AttendanceRecord } from '@/lib/types';

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

    let needsPasswordReset = false;

    // If password field exists and is not empty, use it
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
        needsPasswordReset = true;
    }


    cookies().set('student_id', rollNumber, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Only force password reset if the password field does not exist in the database
    if (needsPasswordReset) {
        cookies().set('force_password_reset', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15, // 15 minutes to reset password
            path: '/',
        });
    } else {
        // Ensure the cookie is cleared if they are logging in with a correct, existing password
        cookies().delete('force_password_reset');
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

export async function getStudentById(id: string): Promise<Student | null> {
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

    return { id: studentDoc.id, ...serializedData } as Student;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

export async function getStudentsByClass(className: string, examType: 'quarterly' | 'halfYearly' | 'annual'): Promise<Student[]> {
  if (!className) return [];
  try {
    const studentsSnapshot = await firestore.collection('students').where('class', '==', className).get();
    if (studentsSnapshot.empty) {
      return [];
    }
    return studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      const serializedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value && typeof value.toDate === 'function') {
            return [key, value.toDate().toISOString()];
          }
          return [key, value];
        })
      );
      delete serializedData.password;
      return { id: doc.id, ...serializedData };
    }) as Student[];
  } catch (error) {
    console.error(`Error fetching students for class ${className}:`, error);
    return [];
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


export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  try {
    const attendanceSnapshot = await firestore.collection('attendance').get();
    const attendanceRecords: AttendanceRecord[] = [];
    
    attendanceSnapshot.forEach(doc => {
      const date = doc.id;
      const data = doc.data();
      if (data && data[studentId]) {
        attendanceRecords.push({
          date,
          status: data[studentId].status,
        });
      }
    });

    // Sort by date descending
    return attendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error(`Error fetching attendance for student ${studentId}:`, error);
    return [];
  }
}

export async function getLoggedInStudent(): Promise<Student | null> {
    const studentId = cookies().get('student_id')?.value;
    if (studentId) {
        return await getStudentById(studentId);
    }
    return null;
}

export async function checkSiblingStatus(student: Student): Promise<boolean> {
  if (!student.parentPhone) {
    return false;
  }
  try {
    const siblingsSnapshot = await firestore.collection('students')
      .where('parentPhone', '==', student.parentPhone)
      .get();
      
    if (siblingsSnapshot.size <= 1) {
      return false;
    }
    
    const siblings = siblingsSnapshot.docs.map(doc => doc.data() as Student);
    // A student is eligible for a sibling discount if there is at least one other sibling with an earlier date of birth.
    const studentDob = new Date(student.dob).getTime();
    return siblings.some(sibling => new Date(sibling.dob).getTime() < studentDob);

  } catch (error) {
    console.error('Error checking sibling status:', error);
    return false;
  }
}
