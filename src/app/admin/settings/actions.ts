
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { getLoggedInUser } from '@/app/auth/actions';

async function checkAdmin() {
  const user = await getLoggedInUser();
  if (!user || user.type !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function setSchoolStatusForToday(isClosed: boolean) {
  await checkAdmin();
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const statusDocRef = firestore.collection('schoolStatus').doc(today);

    if (isClosed) {
      await statusDocRef.set({ status: 'closed', reason: 'School closed by admin.' });
    } else {
      // If the document exists, delete it to mark the school as open
      await statusDocRef.delete();
    }
    
    revalidatePath('/admin');
    return { success: true, message: `School status for today set to ${isClosed ? 'Closed' : 'Open'}.` };
  } catch (error) {
    console.error('Error setting school status:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function saveSettings(settings: any) {
  await checkAdmin();
  try {
    const settingsDocRef = firestore.collection('settings').doc('schoolSettings');
    await settingsDocRef.set(settings, { merge: true });
    revalidatePath('/admin');
    revalidatePath('/student');
    return { success: true, message: 'Settings saved successfully.' };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, message: 'An unexpected error occurred while saving settings.' };
  }
}
