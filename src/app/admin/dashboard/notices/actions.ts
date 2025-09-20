
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
    const noticeData = {
        ...validatedFields.data,
        updatedAt: new Date()
    };
    await firestore.collection('notices').doc(id).update(noticeData);

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
    await firestore.collection('notices').doc(id).delete();
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
      return {
        id: doc.id,
        ...data,
      } as Notice;
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
}
