
'use server';

import { auth, db } from '@/lib/firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function handleLogin(identifier: string, password: string) {
  let email = identifier;
  
  // Basic check to see if it might be a phone number
  const isPhoneNumber = /^\+?[0-9\s-()]+$/.test(identifier);

  if (isPhoneNumber) {
    try {
      const usersRef = collection(db, 'users');
      // Assuming phone numbers are stored in a 'phoneNumber' field
      const q = query(usersRef, where('phoneNumber', '==', identifier));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'No user found with this phone number.' };
      }

      // Assuming phone numbers are unique, take the first result
      const userDoc = querySnapshot.docs[0];
      email = userDoc.data().email; // Get the user's email associated with the phone number
      
      if (!email) {
        return { success: false, error: 'No email associated with this phone number.' };
      }
    } catch (error) {
      console.error('Error fetching user by phone number:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  } else if (!identifier.includes('@')) {
    // Basic validation for email
    return { success: false, error: 'Please enter a valid email or phone number.' };
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    console.error('Firebase authentication error:', error);
    let errorMessage = 'An unknown error occurred.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid credentials. Please check your email/phone and password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'The email address is not valid.';
        break;
      default:
        errorMessage = 'Failed to sign in. Please try again later.';
    }
    return { success: false, error: errorMessage };
  }
}

export async function askFaqAssistant(query: string) {
  // This function is not related to login but keeping it in the file.
  // In a real app, you might want to organize actions into different files.
  try {
    // Dynamically import to avoid breaking non-AI parts if AI setup fails
    const { aiFAQAssistant } = await import('@/ai/flows/ai-faq-assistant');
    const result = await aiFAQAssistant({ query });
    return result.answer;
  } catch (error) {
    console.error('Error in AI FAQ Assistant:', error);
    return 'Sorry, I am having trouble connecting to my knowledge base. Please try again later.';
  }
}
