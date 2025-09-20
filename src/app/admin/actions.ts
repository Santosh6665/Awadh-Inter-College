'use server';

import { z } from 'zod';
import { firestore } from '@/lib/firebase-admin';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAdmin(credentials: z.infer<typeof loginSchema>) {
  try {
    const validatedCredentials = loginSchema.safeParse(credentials);
    if (!validatedCredentials.success) {
      return { success: false, message: 'Invalid credentials format.' };
    }

    const { email, password } = validatedCredentials.data;

    const usersCollection = firestore.collection('users');
    const userDoc = await usersCollection.doc(email).get();

    if (!userDoc.exists) {
      return { success: false, message: 'User not found.' };
    }

    const userData = userDoc.data();

    // WARNING: This is an insecure way to check passwords.
    // In a real application, use Firebase Authentication and compare hashed passwords.
    if (userData?.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    if (userData?.isAdmin !== true) {
      return { success: false, message: 'You do not have admin privileges.' };
    }

    // In a real app, you would set a session cookie here.
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function createAccount(credentials: z.infer<typeof loginSchema>) {
  try {
    const validatedCredentials = loginSchema.safeParse(credentials);
    if (!validatedCredentials.success) {
      return { success: false, message: 'Invalid credentials format.' };
    }

    const { email, password } = validatedCredentials.data;

    const usersCollection = firestore.collection('users');
    const userDocRef = usersCollection.doc(email);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    await userDocRef.set({
      email: email,
      password: password, // WARNING: Storing plain text passwords is not secure.
      isAdmin: false,
      createdAt: new Date(),
    });

    return { success: true, message: 'Account created successfully.' };
  } catch (error) {
    console.error('Account creation error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
