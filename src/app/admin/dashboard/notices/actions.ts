
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Notice } from '@/lib/types';

const NoticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  date: z.string().min(1, 'Date is required.'),
  category: z.enum(['Academics', 'Event', 'General', 'Holiday']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

export type NoticeFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function addNotice(
  prevState: NoticeFormState,
  formData: FormData
): Promise<NoticeFormState> {
  const validatedFields = NoticeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const noticeData = {
        ...validatedFields.data,
        createdAt: new Date(),
    };
    await firestore.collection('notices').add(noticeData);

    // If the notice is a holiday, add it to the holidays collection
    if (noticeData.category === 'Holiday') {
        const holidayDocRef = firestore.collection('holidays').doc(noticeData.date);
        await holidayDocRef.set({
            name: noticeData.title,
            description: noticeData.description,
        }, { merge: true });
    }


    revalidatePath('/admin/dashboard');
    revalidatePath('/notices');
    return { success: true, message: 'Notice added successfully.' };
  } catch (error) {
    console.error('Error adding notice:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function updateNotice(
  id: string,
  prevState: NoticeFormState,
  formData: FormData
): Promise<NoticeFormState> {
  if (!id) {
    return { success: false, message: 'Notice ID is missing.' };
  }

  const validatedFields = NoticeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const noticeDocRef = firestore.collection('notices').doc(id);
    const oldNoticeDoc = await noticeDocRef.get();
    const oldNoticeData = oldNoticeDoc.data();

    const noticeData = {
        ...validatedFields.data,
        updatedAt: new Date()
    };
    await noticeDocRef.update(noticeData);
    
    // Handle holiday changes
    if (oldNoticeData?.category === 'Holiday' && noticeData.category !== 'Holiday') {
        // If it was a holiday and now it's not, delete it from holidays
        await firestore.collection('holidays').doc(oldNoticeData.date).delete();
    } else if (noticeData.category === 'Holiday') {
        // If it's a holiday, add/update it in holidays
        if (oldNoticeData?.date !== noticeData.date && oldNoticeData?.category === 'Holiday') {
            // If date changed, delete the old one
            await firestore.collection('holidays').doc(oldNoticeData.date).delete();
        }
        await firestore.collection('holidays').doc(noticeData.date).set({
            name: noticeData.title,
            description: noticeData.description,
        });
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/notices');
    return { success: true, message: 'Notice updated successfully.' };
  } catch (error) {
    console.error('Error updating notice:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function deleteNotice(id: string) {
  if (!id) {
    return { success: false, message: 'Notice ID is missing.' };
  }
  try {
    const noticeDocRef = firestore.collection('notices').doc(id);
    const noticeDoc = await noticeDocRef.get();
    const noticeData = noticeDoc.data();

    await noticeDocRef.delete();

    // If the deleted notice was a holiday, remove it from the holidays collection
    if (noticeData?.category === 'Holiday') {
        await firestore.collection('holidays').doc(noticeData.date).delete();
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/notices');
    return { success: true, message: 'Notice deleted successfully.' };
  } catch (error) {
    console.error('Error deleting notice:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getNotices(): Promise<Notice[]> {
  try {
    const noticesSnapshot = await firestore.collection('notices').orderBy('date', 'desc').get();
    if (noticesSnapshot.empty) {
      return [];
    }
    return noticesSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to strings to make them serializable for client components
      const serializedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value && typeof value.toDate === 'function') {
            return [key, value.toDate().toISOString()];
          }
          return [key, value];
        })
      );
      return {
        id: doc.id,
        ...serializedData,
      } as Notice;
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
}

export async function getHolidays(): Promise<string[]> {
  try {
    const holidaysSnapshot = await firestore.collection('holidays').get();
    if (holidaysSnapshot.empty) {
      return [];
    }
    return holidaysSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
}
