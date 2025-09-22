
'use server';

import { firestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export async function setSchoolStatusForToday(isClosed: boolean) {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const statusDocRef = firestore.collection('schoolStatus').doc(today);

    if (isClosed) {
      await statusDocRef.set({ status: 'closed', reason: 'School closed by admin.' });
    } else {
      // If the document exists, delete it to mark the school as open
      await statusDocRef.delete();
    }
    
    revalidatePath('/admin/dashboard');
    return { success: true, message: `School status for today set to ${isClosed ? 'Closed' : 'Open'}.` };
  } catch (error) {
    console.error('Error setting school status:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
