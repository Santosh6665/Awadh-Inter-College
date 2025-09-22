
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase-admin';
import type { Student, Teacher } from '@/lib/types';

const loginSchema = z.object({
  emailOrRollNumber: z.string().min(1, 'Please enter your email or roll number.'),
  password: z.string().min(1, 'Please enter your password.'),
});

// Universal Logout Action
export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete('user_id');
  cookieStore.delete('user_type');
  cookieStore.delete('user_name');
  cookieStore.delete('force_password_reset');
  cookieStore.delete('force_teacher_password_reset');
  cookieStore.delete('force_parent_password_reset');

  // Revalidate all portal paths
  revalidatePath('/student');
  revalidatePath('/teacher');
  revalidatePath('/admin');
  revalidatePath('/parent');
  revalidatePath('/');
}

// Universal Login Action
export async function login(credentials: z.infer<typeof loginSchema>) {
  // Clear any existing session cookies first
  await logout();
  
  const validatedCredentials = loginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    return { success: false, message: 'Invalid credentials format.' };
  }

  const { emailOrRollNumber, password } = validatedCredentials.data;
  const isEmail = emailOrRollNumber.includes('@');
  const isNumeric = /^\d+$/.test(emailOrRollNumber);

  // Try logging in as Admin or Teacher first (email-based)
  if (isEmail) {
    const email = emailOrRollNumber;

    // Check Admins
    const adminDoc = await firestore.collection('users').doc(email).get();
    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      if (adminData?.isAdmin === true && adminData?.password === password) {
        setAuthCookies(email, 'admin', adminData.name || 'Admin');
        return { success: true, message: 'Admin login successful', redirect: '/admin' };
      }
    }

    // Check Teachers
    const teacherQuery = await firestore.collection('teachers').where('email', '==', email).limit(1).get();
    if (!teacherQuery.empty) {
        const teacherDoc = teacherQuery.docs[0];
        const teacherData = teacherDoc.data() as Teacher;

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
        
        setAuthCookies(teacherDoc.id, 'teacher', teacherData.name, needsPasswordReset ? 'force_teacher_password_reset' : undefined);
        return { success: true, message: 'Teacher login successful', redirect: '/teacher' };
    }
  }

  // Try logging in as Parent (phone number based)
  if (isNumeric && emailOrRollNumber.length >= 10) {
    const phone = emailOrRollNumber;
    const parentQuery = await firestore.collection('students').where('parentPhone', '==', phone).limit(1).get();
    
    if (!parentQuery.empty) {
      const firstChildDoc = parentQuery.docs[0];
      const firstChildData = firstChildDoc.data() as Student;
      const parentName = firstChildData.fatherName;
      
      const firstNameRaw = firstChildData.name.split(' ')[0];
      const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1);
      const yearOfBirth = new Date(firstChildData.dob).getFullYear();
      const defaultPassword = `${firstName}@${yearOfBirth}`;

      if (password !== defaultPassword) {
        return { success: false, message: 'Incorrect password.' };
      }
      
      setAuthCookies(phone, 'parent', parentName);
      return { success: true, message: 'Parent login successful', redirect: '/parent' };
    }
  }


  // Try logging in as Student (roll number based)
  const rollNumber = emailOrRollNumber;
  const studentDoc = await firestore.collection('students').doc(rollNumber).get();

  if (studentDoc.exists) {
    const studentData = studentDoc.data() as Student;
    
    let needsPasswordReset = false;
    if (studentData.password) {
        if (studentData.password !== password) {
            return { success: false, message: 'Incorrect password.' };
        }
    } else {
        const firstNameRaw = studentData.name.split(' ')[0];
        const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1);
        const yearOfBirth = new Date(studentData.dob).getFullYear();
        const defaultPassword = `${firstName}@${yearOfBirth}`;

        if (password !== defaultPassword) {
            return { success: false, message: 'Incorrect password or password not set.' };
        }
        needsPasswordReset = true;
    }

    setAuthCookies(studentDoc.id, 'student', studentData.name, needsPasswordReset ? 'force_password_reset' : undefined);
    return { success: true, message: 'Student login successful', redirect: '/student' };
  }

  return { success: false, message: 'Invalid credentials. User not found.' };
}

function setAuthCookies(id: string, type: 'student' | 'teacher' | 'admin' | 'parent', name: string, resetCookieName?: string) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    };
    cookies().set('user_id', id, cookieOptions);
    cookies().set('user_type', type, cookieOptions);
    cookies().set('user_name', name, cookieOptions);

    if (resetCookieName) {
        cookies().set(resetCookieName, 'true', {
            ...cookieOptions,
            maxAge: 60 * 15, // 15 minutes to reset
        });
    }
}

export async function getLoggedInUser() {
    const cookieStore = cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userType = cookieStore.get('user_type')?.value;
    const userName = cookieStore.get('user_name')?.value;

    if (userId && userType && userName) {
        return { id: userId, type: userType, name: userName };
    }
    return null;
}
